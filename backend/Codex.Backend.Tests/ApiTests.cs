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

    // Every stateful test uses a distinct random user id. All tests in this class share
    // ONE SQLite fixture (IClassFixture), and Microsoft.Data.Sqlite's shared cache keeps a
    // file-keyed DB alive process-wide, so hardcoded user ids can accumulate review state
    // across runs and make freshness assumptions flaky. Unique ids keep each test isolated.
    private static long FreshUser() => 1_000_000 + Random.Shared.Next(1, 8_000_000);

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
        long user = FreshUser();
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
        long user = FreshUser();
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
    public async Task Progress_ReflectsReviews_AndHasExpectedShape()
    {
        long user = FreshUser();
        await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });

        // Baseline: a brand-new (never-reviewed) user has an all-zero, well-formed payload.
        var before = await Json(await _client.GetAsync($"/api/progress?userId={user}"));
        Assert.Equal(0, before.GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, before.GetProperty("cards").GetProperty("seen").GetInt32());
        Assert.True(before.GetProperty("cards").GetProperty("total").GetInt32() > 0, "catalog is seeded");
        Assert.Equal(28, before.GetProperty("activity").GetArrayLength());
        Assert.Equal(7, before.GetProperty("upcoming").GetArrayLength());
        Assert.True(before.GetProperty("perLesson").GetArrayLength() > 0, "per-lesson breakdown present");
        Assert.Equal(21.0, before.GetProperty("masteryStabilityDays").GetDouble());

        // Take four distinct due items and grade them Again / Hard / Good / Easy.
        var due = await Json(await _client.GetAsync($"/api/due?userId={user}"));
        var items = due.GetProperty("items");
        Assert.True(items.GetArrayLength() >= 4, "need at least four due items to vary grades");
        int[] grades = { 1, 2, 3, 4 };
        for (int i = 0; i < 4; i++)
        {
            string itemId = items[i].GetProperty("itemId").GetString()!;
            var rev = await _client.PostAsJsonAsync("/api/review",
                new { userId = user, itemId, grade = grades[i] });
            rev.EnsureSuccessStatusCode();
        }

        var after = await Json(await _client.GetAsync($"/api/progress?userId={user}"));

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
        foreach (var u in new[] { victim, bystander })
        {
            await _client.PostAsJsonAsync("/api/auth", new { devUserId = u });
            var due = await Json(await _client.GetAsync($"/api/due?userId={u}"));
            string itemId = due.GetProperty("items")[0].GetProperty("itemId").GetString()!;
            await _client.PostAsJsonAsync("/api/review", new { userId = u, itemId, grade = 3 });
        }

        // Both users have one review before the reset.
        Assert.Equal(1, (await Json(await _client.GetAsync($"/api/progress?userId={victim}")))
            .GetProperty("reviewsTotal").GetInt32());

        var del = await _client.DeleteAsync($"/api/progress?userId={victim}");
        del.EnsureSuccessStatusCode();
        var delJson = await Json(del);
        Assert.True(delJson.GetProperty("ok").GetBoolean());
        Assert.True(delJson.GetProperty("eventsDeleted").GetInt32() >= 1);

        // The victim is wiped; the bystander is untouched.
        Assert.Equal(0, (await Json(await _client.GetAsync($"/api/progress?userId={victim}")))
            .GetProperty("reviewsTotal").GetInt32());
        Assert.Equal(0, (await Json(await _client.GetAsync($"/api/progress?userId={victim}")))
            .GetProperty("cards").GetProperty("seen").GetInt32());
        Assert.Equal(1, (await Json(await _client.GetAsync($"/api/progress?userId={bystander}")))
            .GetProperty("reviewsTotal").GetInt32());
    }

    [Fact]
    public async Task LessonProgress_IsMonotonic_AndReflectedInProgress()
    {
        long user = FreshUser();
        const string lesson = "T1.M3.boxing";
        await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });

        // First report: got 3 of 7 segments, not completed.
        var r1 = await Json(await _client.PostAsJsonAsync("/api/lesson-progress",
            new { userId = user, lessonId = lesson, segmentsSeen = 3, segmentsTotal = 7, completed = false }));
        Assert.True(r1.GetProperty("ok").GetBoolean());
        Assert.Equal(3, r1.GetProperty("segmentsSeen").GetInt32());
        Assert.False(r1.GetProperty("completed").GetBoolean());

        // Completion report: all 7 seen + completed=true (sticks).
        var r2 = await Json(await _client.PostAsJsonAsync("/api/lesson-progress",
            new { userId = user, lessonId = lesson, segmentsSeen = 7, segmentsTotal = 7, completed = true }));
        Assert.Equal(7, r2.GetProperty("segmentsSeen").GetInt32());
        Assert.True(r2.GetProperty("completed").GetBoolean());

        // A LATER report with a LOWER segmentsSeen and completed=false must NOT regress
        // (monotonic segments_seen, sticky completed) — e.g. a re-open scrolling only 1 segment.
        var r3 = await Json(await _client.PostAsJsonAsync("/api/lesson-progress",
            new { userId = user, lessonId = lesson, segmentsSeen = 1, segmentsTotal = 7, completed = false }));
        Assert.Equal(7, r3.GetProperty("segmentsSeen").GetInt32()); // never decreases
        Assert.True(r3.GetProperty("completed").GetBoolean());      // completion is sticky

        // GET /api/progress reflects it: top-level rollup + the per-lesson viewing fields.
        var prog = await Json(await _client.GetAsync($"/api/progress?userId={user}"));
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
        await _client.PostAsJsonAsync("/api/auth", new { devUserId = user });
        await _client.PostAsJsonAsync("/api/lesson-progress",
            new { userId = user, lessonId = "T1.M3.boxing", segmentsSeen = 7, segmentsTotal = 7, completed = true });

        Assert.Equal(1, (await Json(await _client.GetAsync($"/api/progress?userId={user}")))
            .GetProperty("lessonsCompleted").GetInt32());

        await _client.DeleteAsync($"/api/progress?userId={user}");

        var after = await Json(await _client.GetAsync($"/api/progress?userId={user}"));
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
}
