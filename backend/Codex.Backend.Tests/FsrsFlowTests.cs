using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Time.Testing;

namespace Codex.Backend.Tests;

/// <summary>
/// FSRS golden-vector + cross-restart-persistence tests. Both drive the REAL review flow through
/// HTTP with a <see cref="FakeTimeProvider"/> wired through DI, so "now" (and therefore elapsed
/// days -> the whole schedule) is deterministic. Time is injected via TimeProvider (default
/// TimeProvider.System in production); tests swap in a fake and advance it explicitly.
/// </summary>
public sealed class FsrsFlowTests
{
    /// <summary>A factory whose TimeProvider is a caller-controlled FakeTimeProvider on a chosen DB file.</summary>
    private sealed class FakeClockFactory : WebApplicationFactory<Program>
    {
        private readonly string _dbPath;
        public FakeTimeProvider Clock { get; }

        public FakeClockFactory(string dbPath, DateTimeOffset start)
        {
            _dbPath = dbPath;
            Clock = new FakeTimeProvider(start);
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration(cfg => cfg.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Database:Path"] = _dbPath,
                ["Auth:DevMode"] = "true",
            }));
            // Replace the system clock with the fake one so the review/FSRS path is deterministic.
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<TimeProvider>();
                services.AddSingleton<TimeProvider>(Clock);
            });
        }
    }

    private static async Task<JsonElement> Json(HttpResponseMessage r)
        => JsonDocument.Parse(await r.Content.ReadAsStringAsync()).RootElement;

    private static async Task<string> AuthToken(HttpClient client, long user)
    {
        var r = await client.PostAsJsonAsync("/api/auth", new { devUserId = user });
        r.EnsureSuccessStatusCode();
        return (await Json(r)).GetProperty("token").GetString()!;
    }

    private static HttpRequestMessage Bearer(HttpMethod m, string path, string token, object? body = null)
    {
        var msg = new HttpRequestMessage(m, path);
        msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body is not null) msg.Content = JsonContent.Create(body);
        return msg;
    }

    /// <summary>
    /// GOLDEN VECTOR — the across-day [Again, Good×5] path.
    ///
    /// NOTE ON THE REFERENCE: py-fsrs's canonical [Again, Good×5] vector is [0,0,1,3,8,21] with
    /// terminal S≈53.627, D≈6.357. Those two leading zeros are SAME-DAY steps that depend on the
    /// FSRS-6 short-term terms (w17..w19). This app's FsrsScheduler INTENTIONALLY omits the
    /// short-term terms (documented in Fsrs.cs and RS-16), so it is faithful to py-fsrs only on the
    /// ACROSS-DAY path — which is what actually drives the due queue. We therefore lock the
    /// across-day golden vector our scheduler produces through the real review flow (each review at
    /// the previous card's continuous interval), as a regression guard on the parameters/formulas.
    /// </summary>
    [Fact]
    public async Task GoldenVector_AgainThenFiveGood_AcrossDays()
    {
        string dbPath = Path.Combine(Path.GetTempPath(), $"codex-golden-{Guid.NewGuid():N}.db");
        var start = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        using var factory = new FakeClockFactory(dbPath, start);
        var client = factory.CreateClient();
        long user = 42_000 + Random.Shared.Next(1, 500_000);
        const string item = "T1.M3.boxing/c1";

        int[] grades = { 1, 3, 3, 3, 3, 3 }; // Again, Good x5
        // Continuous across-day intervals produced by the scheduler (locked from executed code).
        double[] expectedIntervals = { 0.2172, 0.723817, 2.210739, 6.249305, 16.488551, 40.904410 };

        double lastInterval = 0;
        double stability = 0, difficulty = 0;
        for (int i = 0; i < grades.Length; i++)
        {
            // Advance the clock by the previous card's interval, so elapsed-days is exact.
            if (i > 0) factory.Clock.Advance(TimeSpan.FromDays(lastInterval));

            // Re-auth each step: the schedule spans >7 days, longer than a token's lifetime, and the
            // session token expires on the SAME injected clock — so mint a fresh one at "now".
            string token = await AuthToken(client, user);
            var raw = await client.SendAsync(
                Bearer(HttpMethod.Post, "/api/review", token, new { itemId = item, grade = grades[i] }));
            string bodyStr = await raw.Content.ReadAsStringAsync();
            Assert.True(raw.IsSuccessStatusCode, $"review {i} -> {(int)raw.StatusCode}: {bodyStr}");
            var res = JsonDocument.Parse(bodyStr).RootElement;

            double interval = res.GetProperty("intervalDays").GetDouble();
            stability = res.GetProperty("stability").GetDouble();
            difficulty = res.GetProperty("difficulty").GetDouble();
            Assert.InRange(interval, expectedIntervals[i] - 1e-3, expectedIntervals[i] + 1e-3);
            lastInterval = interval;
        }

        // Terminal memory state (locked from executed code; not py-fsrs's short-term terminal).
        Assert.InRange(stability, 40.9044 - 1e-3, 40.9044 + 1e-3);
        Assert.InRange(difficulty, 6.8573 - 1e-3, 6.8573 + 1e-3);
    }

    /// <summary>
    /// PERSISTENCE ACROSS RESTART: review a card against a FILE-backed SQLite, dispose the factory,
    /// reopen the SAME file in a fresh factory with the clock advanced past due, and assert the
    /// schedule persisted — the card left the due queue at review time and comes back due on schedule.
    /// </summary>
    [Fact]
    public async Task Schedule_PersistsAcrossRestart_AndComesDueOnSchedule()
    {
        string dbPath = Path.Combine(Path.GetTempPath(), $"codex-persist-{Guid.NewGuid():N}.db");
        var start = new DateTimeOffset(2026, 3, 1, 0, 0, 0, TimeSpan.Zero);
        long user = 55_000 + Random.Shared.Next(1, 500_000);
        const string item = "T1.M3.boxing/c1";
        double interval;

        // --- boot 1: review the card Good ---
        {
            using var factory = new FakeClockFactory(dbPath, start);
            var client = factory.CreateClient();
            string token = await AuthToken(client, user);

            var dueBefore = await Json(await client.SendAsync(Bearer(HttpMethod.Get, "/api/due", token)));
            Assert.Contains(dueBefore.GetProperty("items").EnumerateArray(),
                x => x.GetProperty("itemId").GetString() == item);

            var res = await Json(await client.SendAsync(
                Bearer(HttpMethod.Post, "/api/review", token, new { itemId = item, grade = 3 })));
            interval = res.GetProperty("intervalDays").GetDouble();
            Assert.InRange(interval, 3.0, 3.5); // new Good ~= 3.26 days

            // Immediately after review the card is NOT due.
            var dueAfter = await Json(await client.SendAsync(Bearer(HttpMethod.Get, "/api/due", token)));
            Assert.DoesNotContain(dueAfter.GetProperty("items").EnumerateArray(),
                x => x.GetProperty("itemId").GetString() == item);
        }

        // --- boot 2: SAME file, fresh factory, clock advanced PAST due ---
        {
            var later = start.AddDays(interval + 0.5); // half a day past due
            using var factory = new FakeClockFactory(dbPath, later);
            var client = factory.CreateClient();
            string token = await AuthToken(client, user);

            // The persisted review count survived the "restart".
            var prog = await Json(await client.SendAsync(Bearer(HttpMethod.Get, "/api/progress", token)));
            Assert.Equal(1, prog.GetProperty("reviewsTotal").GetInt32());
            Assert.Equal(1, prog.GetProperty("cards").GetProperty("seen").GetInt32());

            // With the clock past due, the SAME card is due again on schedule.
            var due = await Json(await client.SendAsync(Bearer(HttpMethod.Get, "/api/due", token)));
            Assert.Contains(due.GetProperty("items").EnumerateArray(),
                x => x.GetProperty("itemId").GetString() == item && !x.GetProperty("isNew").GetBoolean());
        }
    }
}
