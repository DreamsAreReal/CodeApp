using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Codex.Backend.Tests;

/// <summary>
/// Boots the app as it would run in PRODUCTION (Environment=Production, Auth:DevMode=false) and
/// asserts the dev-only surfaces are shut off: the C# runner and the initData signer both 403.
/// This is the config guard — a misconfigured prod box must not expose the authoring/dev tools.
/// </summary>
public sealed class ProdConfigTests
{
    private sealed class ProdFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbPath = Path.Combine(
            Path.GetTempPath(), $"codex-prod-{Guid.NewGuid():N}.db");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Production");
            builder.ConfigureAppConfiguration(cfg => cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Path"] = _dbPath,
                ["Auth:DevMode"] = "false",
                // A bot token so the session-secret derivation has stable input.
                ["Telegram:BotToken"] = "123456789:PROD-TEST-TOKEN",
            }));
        }
    }

    [Fact]
    public async Task RunCSharp_InProduction_Is403()
    {
        using var factory = new ProdFactory();
        var client = factory.CreateClient();
        var r = await client.PostAsJsonAsync("/api/authoring/run-csharp",
            new { code = "System.Console.WriteLine(1);" });
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
    }

    [Fact]
    public async Task SignInitData_InProduction_Is403()
    {
        using var factory = new ProdFactory();
        var client = factory.CreateClient();
        var r = await client.GetAsync("/api/dev/sign-initdata?userId=1");
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
    }

    [Fact]
    public async Task DevAuth_InProduction_Is403()
    {
        // The dev bypass on /api/auth must also be closed in production.
        using var factory = new ProdFactory();
        var client = factory.CreateClient();
        var r = await client.PostAsJsonAsync("/api/auth", new { devUserId = 1L });
        Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode);
    }
}
