using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Codex.Backend.Tests;

/// <summary>
/// End-to-end endpoint tests driven through the real HTTP pipeline (WebApplicationFactory),
/// each against a throwaway SQLite file. Proves: dev auth + session token, the token-gated data
/// API (IDOR guard), due -> review(Good) -> due changes, genuine/tampered initData HMAC,
/// input validation, and the dev-only C# runner.
///
/// The data API no longer accepts a userId param — the user is derived from the Bearer session
/// token minted at /api/auth. Every stateful test auths a fresh user and sends that user's token.
/// </summary>
public sealed class ApiTests : IClassFixture<ApiTests.Factory>
{
    private readonly Factory _factory;
    private readonly HttpClient _client;

    public ApiTests(Factory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

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

    // Every stateful test uses a distinct random user id so accumulated state never crosses tests.
    private static long FreshUser() => 1_000_000 + Random.Shared.Next(1, 8_000_000);

    /// <summary>Dev-auth a user and return their Bearer session token.</summary>
    private async Task<string> AuthToken(long user)
    {
        var r = await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });
        r.EnsureSuccessStatusCode();
        return (await Json(r)).GetProperty("token").GetString()!;
    }

    /// <summary>An HttpMessage builder that carries a user's Bearer token.</summary>
    private HttpRequestMessage Req(HttpMethod method, string path, string token, object? body = null)
    {
        var msg = new HttpRequestMessage(method, path);
        msg.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (body is not null) msg.Content = JsonContent.Create(body);
        return msg;
    }

    private Task<HttpResponseMessage> Get(string path, string token) =>
        _client.SendAsync(Req(HttpMethod.Get, path, token));

    private Task<HttpResponseMessage> Post(string path, string token, object body) =>
        _client.SendAsync(Req(HttpMethod.Post, path, token, body));

    private Task<HttpResponseMessage> Delete(string path, string token) =>
        _client.SendAsync(Req(HttpMethod.Delete, path, token));

    [Fact]
    public async Task DevAuth_CreatesUser_AndReturnsToken()
    {
        var r = await _client.PostAsJsonAsync("/api/auth", new { devUserId = 111L });
        r.EnsureSuccessStatusCode();
        var j = await Json(r);
        Assert.Equal(111, j.GetProperty("userId").GetInt64());
        Assert.Equal("dev", j.GetProperty("mode").GetString());
        Assert.False(string.IsNullOrEmpty(j.GetProperty("token").GetString()), "auth returns a session token");
        Assert.True(j.TryGetProperty("expiresAt", out _), "auth returns an expiry");
    }

    [Fact]
    public async Task Due_Then_ReviewGood_MovesItemOutOfDueQueue()
    {
        long user = FreshUser();
        string token = await AuthToken(user);

        var dueBefore = await Json(await Get("/api/due", token));
        int countBefore = dueBefore.GetProperty("count").GetInt32();
        Assert.True(countBefore > 0, "a fresh user must have new items due");
        string itemId = dueBefore.GetProperty("items")[0].GetProperty("itemId").GetString()!;

        var review = await Json(await Post("/api/review", token, new { itemId, grade = 3 }));
        double interval = review.GetProperty("intervalDays").GetDouble();
        Assert.InRange(interval, 3.0, 3.5); // new Good ~= 3.26 days

        var dueAfter = await Json(await Get("/api/due", token));
        int countAfter = dueAfter.GetProperty("count").GetInt32();
        Assert.Equal(countBefore - 1, countAfter); // reviewed item is no longer due
    }

    [Fact]
    public async Task ReviewGood_SchedulesFurtherOutThanReviewAgain()
    {
        long user = FreshUser();
        string token = await AuthToken(user);

        var good = await Json(await Post("/api/review", token, new { itemId = "T1.M3.boxing/c1", grade = 3 }));
        var again = await Json(await Post("/api/review", token, new { itemId = "T1.M3.boxing/c2", grade = 1 }));

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
        Assert.False(string.IsNullOrEmpty(okJson.GetProperty("token").GetString()), "telegram auth returns a token");

        // Flip one character of the signature -> must be rejected (401).
        string tampered = initData[..^1] + (initData[^1] == 'a' ? 'b' : 'a');
        var bad = await _client.PostAsJsonAsync("/api/auth", new { initData = tampered });
        Assert.Equal(HttpStatusCode.Unauthorized, bad.StatusCode);
    }

    [Fact]
    public async Task Progress_ReflectsReviews_AndHasExpectedShape()
    {
        long user = FreshUser();
        string token = await AuthToken(user);

        // Baseline: a brand-new (never-reviewed) user has an all-zero, well-formed payload.
        var before = await Json(await Get("/api/progress", token));
        Assert.Equal(0, before.GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, before.GetProperty("cards").GetProperty("seen").GetInt32());
        Assert.True(before.GetProperty("cards").GetProperty("total").GetInt32() > 0, "catalog is seeded");
        Assert.Equal(28, before.GetProperty("activity").GetArrayLength());
        Assert.Equal(7, before.GetProperty("upcoming").GetArrayLength());
        Assert.True(before.GetProperty("perLesson").GetArrayLength() > 0, "per-lesson breakdown present");
        Assert.Equal(21.0, before.GetProperty("masteryStabilityDays").GetDouble());

        // Take four distinct due items and grade them Again / Hard / Good / Easy.
        var due = await Json(await Get("/api/due", token));
        var items = due.GetProperty("items");
        Assert.True(items.GetArrayLength() >= 4, "need at least four due items to vary grades");
        int[] grades = { 1, 2, 3, 4 };
        for (int i = 0; i < 4; i++)
        {
            string itemId = items[i].GetProperty("itemId").GetString()!;
            var rev = await Post("/api/review", token, new { itemId, grade = grades[i] });
            rev.EnsureSuccessStatusCode();
        }

        var after = await Json(await Get("/api/progress", token));

        // Headline numbers moved to reflect the four reviews.
        Assert.Equal(4, after.GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(40, after.GetProperty("xp").GetInt32());
        Assert.Equal(1, after.GetProperty("streakDays").GetInt32());
        Assert.Equal(1, after.GetProperty("daysActive").GetInt32());
        Assert.False(after.GetProperty("memberSince").ValueKind == JsonValueKind.Null, "memberSince is set");

        // Grade mix records exactly one of each grade we sent.
        var mix = after.GetProperty("gradeMix");
        Assert.Equal(1, mix.GetProperty("again").GetInt32());
        Assert.Equal(1, mix.GetProperty("hard").GetInt32());
        Assert.Equal(1, mix.GetProperty("good").GetInt32());
        Assert.Equal(1, mix.GetProperty("easy").GetInt32());

        // Card coverage advanced: four distinct items now seen; the Again grade produced a lapse.
        var cards = after.GetProperty("cards");
        Assert.Equal(4, cards.GetProperty("seen").GetInt32());
        Assert.True(cards.GetProperty("lapsesTotal").GetInt32() >= 1, "the Again grade recorded a lapse");

        // Today's activity bucket (last element) counts all four reviews.
        var activity = after.GetProperty("activity");
        int todayCount = activity[activity.GetArrayLength() - 1].GetProperty("count").GetInt32();
        Assert.Equal(4, todayCount);

        // Seen count across per-lesson buckets equals cards.seen.
        int perLessonSeen = 0;
        foreach (var l in after.GetProperty("perLesson").EnumerateArray())
            perLessonSeen += l.GetProperty("seen").GetInt32();
        Assert.Equal(4, perLessonSeen);
    }

    [Fact]
    public async Task DeleteProgress_ErasesOnlyThisUsersHistory()
    {
        long victim = FreshUser();
        long bystander = FreshUser();
        string victimToken = await AuthToken(victim);
        string bystanderToken = await AuthToken(bystander);
        foreach (var (u, t) in new[] { (victim, victimToken), (bystander, bystanderToken) })
        {
            var due = await Json(await Get("/api/due", t));
            string itemId = due.GetProperty("items")[0].GetProperty("itemId").GetString()!;
            await Post("/api/review", t, new { itemId, grade = 3 });
        }

        // Both users have one review before the reset.
        Assert.Equal(1, (await Json(await Get("/api/progress", victimToken)))
            .GetProperty("reviewsTotal").GetInt32());

        var del = await Delete("/api/progress", victimToken);
        del.EnsureSuccessStatusCode();
        var delJson = await Json(del);
        Assert.True(delJson.GetProperty("ok").GetBoolean());
        Assert.True(delJson.GetProperty("eventsDeleted").GetInt32() >= 1);

        // The victim is wiped; the bystander is untouched.
        Assert.Equal(0, (await Json(await Get("/api/progress", victimToken)))
            .GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, (await Json(await Get("/api/progress", victimToken)))
            .GetProperty("cards").GetProperty("seen").GetInt32());
        Assert.Equal(1, (await Json(await Get("/api/progress", bystanderToken)))
            .GetProperty("reviewsTotal").GetInt32());
    }

    [Fact]
    public async Task LessonProgress_IsMonotonic_AndReflectedInProgress()
    {
        long user = FreshUser();
        const string lesson = "T1.M3.boxing";
        string token = await AuthToken(user);

        // First report: got 3 of 7 segments, not completed.
        var r1 = await Json(await Post("/api/lesson-progress", token,
            new { lessonId = lesson, segmentsSeen = 3, segmentsTotal = 7, completed = false }));
        Assert.True(r1.GetProperty("ok").GetBoolean());
        Assert.Equal(3, r1.GetProperty("segmentsSeen").GetInt32());
        Assert.False(r1.GetProperty("completed").GetBoolean());

        // Completion report: all 7 seen + completed=true (sticks).
        var r2 = await Json(await Post("/api/lesson-progress", token,
            new { lessonId = lesson, segmentsSeen = 7, segmentsTotal = 7, completed = true }));
        Assert.Equal(7, r2.GetProperty("segmentsSeen").GetInt32());
        Assert.True(r2.GetProperty("completed").GetBoolean());

        // A LATER report with a LOWER segmentsSeen and completed=false must NOT regress
        // (monotonic segments_seen, sticky completed).
        var r3 = await Json(await Post("/api/lesson-progress", token,
            new { lessonId = lesson, segmentsSeen = 1, segmentsTotal = 7, completed = false }));
        Assert.Equal(7, r3.GetProperty("segmentsSeen").GetInt32()); // never decreases
        Assert.True(r3.GetProperty("completed").GetBoolean());      // completion is sticky

        // GET /api/progress reflects it: top-level rollup + the per-lesson viewing fields.
        var prog = await Json(await Get("/api/progress", token));
        Assert.Equal(1, prog.GetProperty("lessonsCompleted").GetInt32());
        Assert.Equal(1, prog.GetProperty("lessonsStarted").GetInt32());
        Assert.True(prog.GetProperty("lessonsTotal").GetInt32() > 0, "lessonsTotal reflects the catalog");
        Assert.Equal(7, prog.GetProperty("segmentsViewed").GetInt32());

        var row = prog.GetProperty("perLesson").EnumerateArray()
            .First(l => l.GetProperty("lessonId").GetString() == lesson);
        Assert.Equal(7, row.GetProperty("segmentsSeen").GetInt32());
        Assert.Equal(7, row.GetProperty("segmentsTotal").GetInt32());
        Assert.True(row.GetProperty("completed").GetBoolean());

        // A brand-new lesson never reported stays 0/false in the same payload (no over-count).
        var untouched = prog.GetProperty("perLesson").EnumerateArray()
            .First(l => l.GetProperty("lessonId").GetString() != lesson);
        Assert.Equal(0, untouched.GetProperty("segmentsSeen").GetInt32());
        Assert.False(untouched.GetProperty("completed").GetBoolean());
    }

    [Fact]
    public async Task ResetProgress_AlsoClearsLessonViewing()
    {
        long user = FreshUser();
        string token = await AuthToken(user);
        await Post("/api/lesson-progress", token,
            new { lessonId = "T1.M3.boxing", segmentsSeen = 7, segmentsTotal = 7, completed = true });

        Assert.Equal(1, (await Json(await Get("/api/progress", token)))
            .GetProperty("lessonsCompleted").GetInt32());

        await Delete("/api/progress", token);

        var after = await Json(await Get("/api/progress", token));
        Assert.Equal(0, after.GetProperty("lessonsCompleted").GetInt32());
        Assert.Equal(0, after.GetProperty("segmentsViewed").GetInt32());
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

    // ======================= IDOR GUARD =======================

    [Theory]
    [InlineData("GET", "/api/due")]
    [InlineData("GET", "/api/stats")]
    [InlineData("GET", "/api/progress")]
    [InlineData("POST", "/api/review")]
    [InlineData("POST", "/api/lesson-progress")]
    [InlineData("DELETE", "/api/progress")]
    public async Task DataEndpoint_WithoutToken_Is401(string method, string path)
    {
        var msg = new HttpRequestMessage(new HttpMethod(method), path);
        if (method == "POST") msg.Content = JsonContent.Create(new { itemId = "x", grade = 3, lessonId = "x", segmentsSeen = 0, segmentsTotal = 0, completed = false });
        var r = await _client.SendAsync(msg);
        Assert.Equal(HttpStatusCode.Unauthorized, r.StatusCode);
    }

    [Fact]
    public async Task DataEndpoint_WithGarbageToken_Is401()
    {
        var r = await Get("/api/progress", "not.a.valid-token");
        Assert.Equal(HttpStatusCode.Unauthorized, r.StatusCode);
    }

    [Fact]
    public async Task Token_OnlyEverReadsAndMutatesItsOwnUsersData()
    {
        long userA = FreshUser();
        long userB = FreshUser();
        string tokenA = await AuthToken(userA);
        string tokenB = await AuthToken(userB);

        // User A reviews a card.
        var dueA = await Json(await Get("/api/due", tokenA));
        string itemA = dueA.GetProperty("items")[0].GetProperty("itemId").GetString()!;
        await Post("/api/review", tokenA, new { itemId = itemA, grade = 3 });

        // A's token sees A's one review; B's token sees zero — B cannot read A's data.
        Assert.Equal(1, (await Json(await Get("/api/progress", tokenA))).GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, (await Json(await Get("/api/progress", tokenB))).GetProperty("reviewsTotal").GetInt32());

        // B wipes with its own token -> A is untouched (B cannot delete A's data; there is no
        // userId param to point at a victim anymore).
        await Delete("/api/progress", tokenB);
        Assert.Equal(1, (await Json(await Get("/api/progress", tokenA))).GetProperty("reviewsTotal").GetInt32());

        // The userId the server reports for A's token is A, not anything the client chose.
        Assert.Equal(userA, (await Json(await Get("/api/progress", tokenA))).GetProperty("userId").GetInt64());
        Assert.Equal(userB, (await Json(await Get("/api/progress", tokenB))).GetProperty("userId").GetInt64());
    }

    // ======================= AUTH EDGE CASES =======================

    [Fact]
    public async Task Auth_ExpiredAuthDate_Is401()
    {
        // Sign initData with an auth_date well outside the default 24h freshness window.
        string botToken = "123456789:DEV-BOT-TOKEN-not-a-real-bot-do-not-use-in-prod";
        string initData = TelegramAuth.SignInitData(555, botToken, DateTimeOffset.UtcNow.AddDays(-3));
        var r = await _client.PostAsJsonAsync("/api/auth", new { initData });
        Assert.Equal(HttpStatusCode.Unauthorized, r.StatusCode);
    }

    [Fact]
    public async Task Auth_MissingHash_Is401()
    {
        var r = await _client.PostAsJsonAsync("/api/auth",
            new { initData = "auth_date=1700000000&user=%7B%22id%22%3A1%7D" }); // no hash
        Assert.Equal(HttpStatusCode.Unauthorized, r.StatusCode);
    }

    [Fact]
    public async Task Auth_MalformedUserJson_Is401()
    {
        string botToken = "123456789:DEV-BOT-TOKEN-not-a-real-bot-do-not-use-in-prod";
        // A genuinely-HMAC'd payload whose `user` field is not valid JSON must still be rejected.
        string initData = SignRaw(botToken, ("auth_date", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            ("user", "{not-json"));
        var r = await _client.PostAsJsonAsync("/api/auth", new { initData });
        Assert.Equal(HttpStatusCode.Unauthorized, r.StatusCode);
    }

    [Fact]
    public async Task Auth_UnknownExtraField_StillValidates_ForwardCompat()
    {
        string botToken = "123456789:DEV-BOT-TOKEN-not-a-real-bot-do-not-use-in-prod";
        // A future Telegram field the server does not know about must be INCLUDED in the HMAC
        // (data-check-string covers every field but `hash`), so a genuine payload still validates.
        string initData = SignRaw(botToken,
            ("auth_date", DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()),
            ("future_field", "brand-new-2027"),
            ("user", "{\"id\":777}"));
        var r = await _client.PostAsJsonAsync("/api/auth", new { initData });
        r.EnsureSuccessStatusCode();
        Assert.Equal(777, (await Json(r)).GetProperty("userId").GetInt64());
    }

    /// <summary>Build a genuinely-HMAC'd initData over arbitrary fields (for edge-case tests).</summary>
    private static string SignRaw(string botToken, params (string Key, string Value)[] fields)
    {
        var sorted = new SortedDictionary<string, string>(StringComparer.Ordinal);
        foreach (var (k, v) in fields) sorted[k] = v;
        string dcs = string.Join('\n', sorted.Select(kv => $"{kv.Key}={kv.Value}"));
        byte[] secret = System.Security.Cryptography.HMACSHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes("WebAppData"), System.Text.Encoding.UTF8.GetBytes(botToken));
        string hash = Convert.ToHexStringLower(System.Security.Cryptography.HMACSHA256.HashData(
            secret, System.Text.Encoding.UTF8.GetBytes(dcs)));
        var query = sorted.Select(kv => $"{Uri.EscapeDataString(kv.Key)}={Uri.EscapeDataString(kv.Value)}");
        return string.Join('&', query) + "&hash=" + hash;
    }

    // ======================= INPUT VALIDATION =======================

    [Theory]
    [InlineData(0)]
    [InlineData(5)]
    public async Task Review_OutOfRangeGrade_Is400(int grade)
    {
        string token = await AuthToken(FreshUser());
        var r = await Post("/api/review", token, new { itemId = "T1.M3.boxing/c1", grade });
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task LessonProgress_BlankLessonId_Is400()
    {
        string token = await AuthToken(FreshUser());
        var r = await Post("/api/lesson-progress", token,
            new { lessonId = "", segmentsSeen = 1, segmentsTotal = 3, completed = false });
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task LessonProgress_NegativeSegments_Is400()
    {
        string token = await AuthToken(FreshUser());
        var r = await Post("/api/lesson-progress", token,
            new { lessonId = "T1.M3.boxing", segmentsSeen = -1, segmentsTotal = 3, completed = false });
        Assert.Equal(HttpStatusCode.BadRequest, r.StatusCode);
    }

    [Fact]
    public async Task Progress_ForUserWithNoData_IsWellFormedAllZero()
    {
        string token = await AuthToken(FreshUser());
        var p = await Json(await Get("/api/progress", token));
        Assert.Equal(0, p.GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, p.GetProperty("xp").GetInt32());
        Assert.Equal(0, p.GetProperty("streakDays").GetInt32());
        Assert.Equal(0, p.GetProperty("cards").GetProperty("seen").GetInt32());
        Assert.Equal(0, p.GetProperty("segmentsViewed").GetInt32());
        Assert.Equal(28, p.GetProperty("activity").GetArrayLength());
        Assert.Equal(7, p.GetProperty("upcoming").GetArrayLength());
    }

    [Fact]
    public async Task Lessons_UnknownId_Is404()
    {
        // /api/lessons/{id} is token-gated like the rest of the data API, so authenticate first;
        // an unknown lesson for an authenticated caller is a 404.
        string token = await AuthToken(FreshUser());
        var r = await Get("/api/lessons/this-lesson-does-not-exist", token);
        Assert.Equal(HttpStatusCode.NotFound, r.StatusCode);
    }

    // ======================= CONCURRENCY (guards the PRAGMA fix) =======================

    [Fact]
    public async Task ConcurrentReviews_ForOneUser_NoDatabaseLocked()
    {
        long user = FreshUser();
        string token = await AuthToken(user);
        var due = await Json(await Get("/api/due", token));
        var items = due.GetProperty("items");
        // The seed catalog has a handful of reviewable items; fire ALL of them concurrently.
        int n = items.GetArrayLength();
        Assert.True(n >= 5, "need several due items to fire concurrently");

        var tasks = new List<Task<HttpResponseMessage>>();
        for (int i = 0; i < n; i++)
        {
            string itemId = items[i].GetProperty("itemId").GetString()!;
            tasks.Add(Post("/api/review", token, new { itemId, grade = 3 }));
        }
        var results = await Task.WhenAll(tasks);

        foreach (var res in results)
        {
            string body = await res.Content.ReadAsStringAsync();
            Assert.True(res.IsSuccessStatusCode, $"review failed: {(int)res.StatusCode} {body}");
            Assert.DoesNotContain("locked", body, StringComparison.OrdinalIgnoreCase);
        }

        // All n reviews were durably recorded.
        Assert.Equal(n, (await Json(await Get("/api/progress", token))).GetProperty("reviewsTotal").GetInt32());
    }
}
