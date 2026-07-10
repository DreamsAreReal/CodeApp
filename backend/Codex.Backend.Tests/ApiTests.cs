using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Codex.Backend.Tests;

/// <summary>
/// End-to-end endpoint tests driven through the real HTTP pipeline (WebApplicationFactory),
/// each against a throwaway SQLite file. Proves: dev auth, due -> review(Good) -> due changes,
/// genuine/tampered initData HMAC, and the dev-only C# runner.
/// </summary>
public sealed class ApiTests : IClassFixture<ApiTests.Factory>
{
    private readonly HttpClient _client;

    public ApiTests(Factory factory) => _client = factory.CreateClient();

    public sealed class Factory : WebApplicationFactory<Program>
    {
        private readonly string _dbPath = Path.Combine(
            Path.GetTempPath(), $"codex-test-{Guid.NewGuid():N}.db");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // ConfigureAppConfiguration here is applied last -> overrides appsettings.json.
            builder.ConfigureAppConfiguration(cfg => cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Path"] = _dbPath,
                ["Auth:DevMode"] = "true",
            }));
        }
    }

    private static async Task<JsonElement> Json(HttpResponseMessage r)
        => JsonDocument.Parse(await r.Content.ReadAsStringAsync()).RootElement;

    [Fact]
    public async Task DevAuth_CreatesUser()
    {
        var r = await _client.PostAsJsonAsync("/api/auth", new { devUserId = 111L });
        r.EnsureSuccessStatusCode();
        var j = await Json(r);
        Assert.Equal(111, j.GetProperty("userId").GetInt64());
        Assert.Equal("dev", j.GetProperty("mode").GetString());
    }

    [Fact]
    public async Task Due_Then_ReviewGood_MovesItemOutOfDueQueue()
    {
        const long user = 222;
        await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });

        var dueBefore = await Json(await _client.GetAsync($"/api/due?userId={user}"));
        int countBefore = dueBefore.GetProperty("count").GetInt32();
        Assert.True(countBefore > 0, "a fresh user must have new items due");
        string itemId = dueBefore.GetProperty("items")[0].GetProperty("itemId").GetString()!;

        var review = await Json(await _client.PostAsJsonAsync("/api/review",
            new { userId = user, itemId, grade = 3 }));
        double interval = review.GetProperty("intervalDays").GetDouble();
        Assert.InRange(interval, 3.0, 3.5); // new Good ~= 3.26 days

        var dueAfter = await Json(await _client.GetAsync($"/api/due?userId={user}"));
        int countAfter = dueAfter.GetProperty("count").GetInt32();
        Assert.Equal(countBefore - 1, countAfter); // reviewed item is no longer due
    }

    [Fact]
    public async Task ReviewGood_SchedulesFurtherOutThanReviewAgain()
    {
        const long user = 333;
        await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });

        var good = await Json(await _client.PostAsJsonAsync("/api/review",
            new { userId = user, itemId = "T1.M3.boxing/c1", grade = 3 }));
        var again = await Json(await _client.PostAsJsonAsync("/api/review",
            new { userId = user, itemId = "T1.M3.boxing/c2", grade = 1 }));

        Assert.True(good.GetProperty("intervalDays").GetDouble()
                    > again.GetProperty("intervalDays").GetDouble());
    }

    [Fact]
    public async Task GenuineInitData_Validates_TamperedIsRejected()
    {
        // Produce a genuinely-signed initData via the dev helper (real HMAC), then auth with it.
        var signed = await Json(await _client.GetAsync("/api/dev/sign-initdata?userId=999"));
        string initData = signed.GetProperty("initData").GetString()!;

        var ok = await _client.PostAsJsonAsync("/api/auth", new { initData });
        ok.EnsureSuccessStatusCode();
        var okJson = await Json(ok);
        Assert.Equal(999, okJson.GetProperty("userId").GetInt64());
        Assert.Equal("telegram", okJson.GetProperty("mode").GetString());

        // Flip one character of the signature -> must be rejected (401).
        string tampered = initData[..^1] + (initData[^1] == 'a' ? 'b' : 'a');
        var bad = await _client.PostAsJsonAsync("/api/auth", new { initData = tampered });
        Assert.Equal(HttpStatusCode.Unauthorized, bad.StatusCode);
    }

    [Fact]
    public async Task RunCSharp_ReturnsRealStdout()
    {
        // The boxing answer-execution: value is copied on boxing, so o stays 123.
        var r = await Json(await _client.PostAsJsonAsync("/api/authoring/run-csharp", new
        {
            code = "int i = 123; object o = i; i = 456; System.Console.WriteLine(o);"
        }));
        Assert.True(r.GetProperty("success").GetBoolean());
        Assert.Equal("123", r.GetProperty("stdout").GetString()!.Trim());
    }
}
