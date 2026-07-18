using System.Text.Encodings.Web;
using System.Text.Unicode;
using System.Threading.RateLimiting;
using Codex.Backend;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Route host logs to stderr so they never pollute the dev CSharpRunner's captured stdout
// (it redirects Console.Out to grab a snippet's output). Keeps the authoring answer-execution
// gate clean and its test non-flaky; logs still surface on stderr (Docker captures both).
builder.Services.Configure<Microsoft.Extensions.Logging.Console.ConsoleLoggerOptions>(
    o => o.LogToStandardErrorThreshold = Microsoft.Extensions.Logging.LogLevel.Trace);

// ---- configuration ----
var cfg = builder.Configuration;
string botToken = cfg["Telegram:BotToken"] ?? "";
bool devMode = cfg.GetValue("Auth:DevMode", true);
int maxAgeSeconds = cfg.GetValue("Auth:MaxAgeSeconds", 86400);
int runnerTimeout = cfg.GetValue("CSharpRunner:TimeoutSeconds", 10);
// Daily new-card limit (ADR-0002): never-reviewed cards released per UTC day. Review cards
// are never limited. Configurable (Fsrs:NewCardsPerDay) so tests can drive a different budget.
int newCardsPerDay = cfg.GetValue("Fsrs:NewCardsPerDay", 10);
string? sessionSecret = cfg["Auth:SessionSecret"];
string dbPath = Path.Combine(builder.Environment.ContentRootPath, cfg["Database:Path"] ?? "codex.db");
string lessonsDir = Path.Combine(builder.Environment.ContentRootPath, "seed", "lessons");
string[] corsOrigins = cfg.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
bool isDev = builder.Environment.IsDevelopment();

// ---- services ----
var db = new Database(dbPath);
var lessons = new LessonStore(lessonsDir);
var fsrs = new FsrsScheduler(desiredRetention: 0.9);
var runner = new CSharpRunner(TimeSpan.FromSeconds(runnerTimeout));

builder.Services.AddSingleton(db);
builder.Services.AddSingleton(lessons);
builder.Services.AddSingleton(fsrs);
builder.Services.AddSingleton(runner);
// TimeProvider is injectable so tests can drive the review/FSRS clock deterministically
// (FakeTimeProvider). Production uses the real system clock.
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton(sp =>
    new SessionTokenService(sessionSecret, botToken, sp.GetRequiredService<TimeProvider>()));
builder.Services.AddSingleton(sp =>
    new ReviewService(db, fsrs, sp.GetRequiredService<TimeProvider>()));

// RFC7807 problem+json for unhandled exceptions (instead of a bare 500).
builder.Services.AddProblemDetails();

// Keep Cyrillic (product language: ru) readable in JSON responses instead of \uXXXX escapes.
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All));

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (corsOrigins.Length > 0) p.WithOrigins(corsOrigins);
    else p.AllowAnyOrigin();
    p.AllowAnyHeader().AllowAnyMethod();
}));

// Rate limiting: partition by the authenticated tgId (falls back to remote IP before auth),
// fixed window. Applied only to the mutating endpoints below via RequireRateLimiting.
// The per-minute permit count is configurable (RateLimit:PermitPerMinute) so tests can drive a
// tiny limit deterministically; the production default stays 60/min.
const string MutatingLimiter = "mutating";
int permitPerMinute = cfg.GetValue("RateLimit:PermitPerMinute", 60);
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(MutatingLimiter, ctx =>
    {
        string key = ctx.Items.TryGetValue(AuthMiddleware.TgIdKey, out var v) && v is long id
            ? $"tg:{id}"
            : $"ip:{ctx.Connection.RemoteIpAddress}";
        return RateLimitPartition.GetFixedWindowLimiter(key, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = permitPerMinute,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0,
        });
    });
});

// Behind cloudflared/Caddy in production: trust forwarded proto/host so HTTPS/HSTS work.
if (!isDev)
{
    builder.Services.Configure<ForwardedHeadersOptions>(o =>
    {
        o.ForwardedHeaders = ForwardedHeaders.All;
        // The reverse proxy is trusted; the known-networks/proxies allowlist would otherwise
        // reject forwarded headers from cloudflared's dynamic IPs.
        o.KnownIPNetworks.Clear();
        o.KnownProxies.Clear();
    });
}

var app = builder.Build();

// ---- exception handling: unhandled -> RFC7807 problem+json ----
app.UseExceptionHandler();
app.UseStatusCodePages();

// ---- production hardening (never in Development, so local http :5080 keeps working) ----
if (!isDev)
{
    app.UseForwardedHeaders();
    app.UseHsts();
    app.Use(async (ctx, next) =>
    {
        // Telegram embeds the Mini App in an iframe, so X-Frame-Options: DENY would break it.
        // A frame-ancestors CSP allows exactly Telegram's web/app hosts to frame us.
        ctx.Response.Headers["Content-Security-Policy"] =
            "frame-ancestors https://web.telegram.org https://*.telegram.org tg://resolve";
        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        await next();
    });
}

app.UseCors();

// ---- serve the built frontend (single origin: the same host serves the app AND
//      /api, which is the simplest, CORS-free setup for a Telegram Mini App).
//      Guarded: if no frontend build is present, the backend stays API-only (dev). ----
string distPath = cfg["Frontend:DistPath"] is { Length: > 0 } dp
    ? (Path.IsPathRooted(dp) ? dp : Path.Combine(builder.Environment.ContentRootPath, dp))
    : Path.Combine(builder.Environment.ContentRootPath, "wwwroot");
bool serveFrontend = Directory.Exists(distPath);
Microsoft.Extensions.FileProviders.PhysicalFileProvider? frontend = null;
if (serveFrontend)
{
    frontend = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(distPath);
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = frontend });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = frontend });
}

// ---- routing must run BEFORE the rate limiter so the limiter can resolve each endpoint's
//      named RequireRateLimiting policy (endpoint-level policies are a no-op if UseRateLimiter
//      runs before routing). ----
app.UseRouting();

// ---- auth gate: validates the Bearer session token on every /api/* except the public routes,
//      and stashes the authenticated tgId for the handlers. MUST run before the rate limiter so
//      the limiter can partition by tgId. ----
var tokens = app.Services.GetRequiredService<SessionTokenService>();
app.UseMiddleware<AuthMiddleware>();
app.UseRateLimiter();

// ---- startup: run migrations (user_version-gated) + seed catalog ----
db.Initialize();
foreach (var item in lessons.Items) db.SeedItem(item);
// Prune any catalog item no longer present in the seed (e.g. a card removed from a lesson),
// so a stale item can never keep appearing as "due". Cascades to that item's user state/events.
db.ReconcileCatalog(lessons.Items.Select(i => i.ItemId));

// ---- graceful shutdown: fold the WAL into the main DB before SIGTERM on redeploy ----
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    try { db.Checkpoint(); }
    catch { /* best-effort on shutdown; never block termination */ }
});

TimeSpan? maxAge = maxAgeSeconds > 0 ? TimeSpan.FromSeconds(maxAgeSeconds) : null;

// ---- health checks ----
// /health/live and /health (alias): static 200, no dependencies (used by deploy/tunnel curls).
app.MapGet("/health", () => Results.Ok(new { status = "ok", fsrs = "fsrs-6", storage = "sqlite" }));
app.MapGet("/health/live", () => Results.Ok(new { status = "live" }));
// /health/ready: proves the DB is reachable (SELECT 1) -> 200, else 503.
app.MapGet("/health/ready", (Database database) =>
{
    try
    {
        database.Ping();
        return Results.Ok(new { status = "ready" });
    }
    catch
    {
        return Results.Json(new { status = "unready" }, statusCode: 503);
    }
});

// ---- POST /api/auth : validate initData (HMAC), create user, mint a session token ----
app.MapPost("/api/auth", (AuthRequest req) =>
{
    // Dev bypass: only when dev mode is on and an explicit dev user id is supplied.
    if (req.DevUserId is { } devId)
    {
        if (!devMode) return Results.Json(new { error = Strings.DevModeDisabled }, statusCode: 403);
        var devUser = db.UpsertUser(devId);
        var (devToken, devExp) = tokens.Issue(devUser.TgId);
        return Results.Ok(new { userId = devUser.TgId, created = devUser.Created, mode = "dev", token = devToken, expiresAt = devExp });
    }

    var res = TelegramAuth.Validate(req.InitData ?? "", botToken, maxAge);
    if (!res.Ok) return Results.Json(new { error = res.Error }, statusCode: 401);

    var user = db.UpsertUser(res.UserId);
    var (token, expiresAt) = tokens.Issue(user.TgId);
    return Results.Ok(new { userId = user.TgId, created = user.Created, mode = "telegram", token, expiresAt });
});

// DEV-ONLY simulation clock: in dev mode, an `X-Sim-Now` header (ISO-8601) overrides the request's
// "now" so verify/sim-14d can drive a deterministic multi-day timeline through the SAME clock used by
// both the new-card limiter (/api/due) and the FSRS schedule (/api/review). Ignored entirely when
// devMode is off (production), so it can never affect a real deployment.
DateTimeOffset SimNow(HttpContext http, TimeProvider clock)
{
    if (devMode
        && http.Request.Headers.TryGetValue("X-Sim-Now", out var v)
        && DateTimeOffset.TryParse(v.ToString(), out var simNow))
        return simNow.ToUniversalTime();
    return clock.GetUtcNow();
}

// ---- GET /api/due : items due now for the authenticated user ----
app.MapGet("/api/due", (HttpContext http, TimeProvider clock) =>
{
    long userId = http.TgId();
    var now = SimNow(http, clock);
    var due = db.GetDue(userId, now, newCardsPerDay);
    return Results.Ok(new { userId, now, count = due.Count, items = due });
});

// ---- GET /api/stats : durable, server-derived home stats (reviews / streak / xp) ----
app.MapGet("/api/stats", (HttpContext http, TimeProvider clock) =>
{
    long userId = http.TgId();
    var (reviewsTotal, streakDays) = db.GetStats(userId, clock.GetUtcNow());
    return Results.Ok(new
    {
        userId,
        reviewsTotal,
        streakDays,
        xp = reviewsTotal * 10, // 10 XP per completed review (deterministic, history-backed)
    });
});

// ---- GET /api/progress : full, server-derived progress dashboard (real numbers only) ----
app.MapGet("/api/progress", (HttpContext http, TimeProvider clock) =>
{
    long userId = http.TgId();
    var now = clock.GetUtcNow();
    var (reviewsTotal, streakDays) = db.GetStats(userId, now);
    var created = db.GetUserCreated(userId);
    var gradeMix = db.GetGradeMix(userId);
    var calibration = db.GetCalibration(userId); // confidence-vs-outcome (typed-answer cards)
    var cards = db.GetCardsSummary(userId);
    var perLesson = db.GetPerLesson(userId, now);
    var completion = db.GetCompletionSummary(userId); // lesson-viewing rollup (honest "прохождение")
    var activity = db.GetActivity(userId, now, 28); // 4 weeks, for the heatmap
    var upcoming = db.GetUpcoming(userId, now, 7);  // next 7 days, forward FSRS schedule

    return Results.Ok(new
    {
        userId,
        reviewsTotal,
        streakDays,
        xp = reviewsTotal * 10, // same rule as /api/stats — 10 XP per review, history-backed
        memberSince = created, // null for a user who has never authed
        daysActive = db.GetDaysActive(userId),
        masteryStabilityDays = Database.MasteryStabilityDays,
        // lesson-viewing rollup — a TRUTHFUL "how far through the material" signal,
        // deliberately separate from card mastery (viewing != learning).
        lessonsTotal = completion.LessonsTotal,
        lessonsCompleted = completion.LessonsCompleted,
        lessonsStarted = completion.LessonsStarted,
        segmentsViewed = completion.SegmentsSeenTotal,
        gradeMix = new
        {
            again = gradeMix.Again,
            hard = gradeMix.Hard,
            good = gradeMix.Good,
            easy = gradeMix.Easy,
        },
        calibration = new
        {
            answered = calibration.Answered,
            wellCalibrated = calibration.WellCalibrated,
            overconfident = calibration.Overconfident,
            underconfident = calibration.Underconfident,
        },
        cards = new
        {
            seen = cards.Seen,
            total = cards.Total,
            mastered = cards.Mastered,
            lapsesTotal = cards.LapsesTotal,
        },
        perLesson = perLesson.Select(l => new
        {
            lessonId = l.LessonId,
            seen = l.Seen,
            total = l.Total,
            mastered = l.Mastered,
            due = l.Due,
            segmentsSeen = l.SegmentsSeen,
            segmentsTotal = l.SegmentsTotal,
            completed = l.Completed,
        }),
        activity = activity.Select(d => new { day = d.Day, count = d.Count }),
        upcoming = upcoming.Select(d => new { day = d.Day, count = d.Count }),
    });
});

// ---- POST /api/lesson-progress : report lesson-viewing progress (monotonic UPSERT) ----
app.MapPost("/api/lesson-progress", (HttpContext http, LessonProgressRequest req, TimeProvider clock) =>
{
    long userId = http.TgId();
    if (string.IsNullOrWhiteSpace(req.LessonId))
        return Results.Json(new { error = Strings.InvalidLessonProgress }, statusCode: 400);
    if (req.SegmentsTotal < 0 || req.SegmentsSeen < 0)
        return Results.Json(new { error = Strings.InvalidLessonProgress }, statusCode: 400);

    var saved = db.UpsertLessonProgress(
        userId, req.LessonId, req.SegmentsSeen, req.SegmentsTotal, req.Completed, clock.GetUtcNow());

    return Results.Ok(new
    {
        ok = true,
        userId,
        lessonId = saved.LessonId,
        segmentsSeen = saved.SegmentsSeen,
        segmentsTotal = saved.SegmentsTotal,
        completed = saved.Completed,
    });
}).RequireRateLimiting(MutatingLimiter);

// ---- DELETE /api/progress : erase THIS user's FSRS state + history (double-confirmed in UI) ----
app.MapDelete("/api/progress", (HttpContext http) =>
{
    long userId = http.TgId();
    var (reviewStates, events) = db.ResetProgress(userId);
    return Results.Ok(new { ok = true, userId, reviewStatesDeleted = reviewStates, eventsDeleted = events });
}).RequireRateLimiting(MutatingLimiter);

// ---- POST /api/review : update FSRS state, return next due, append history ----
app.MapPost("/api/review", (HttpContext http, ReviewRequest req, ReviewService reviews, TimeProvider clock) =>
{
    if (req.Grade is < 1 or > 4)
        return Results.Json(new { error = Strings.InvalidGrade }, statusCode: 400);

    long userId = http.TgId();
    // Correct/Confidence are optional calibration signals (null when the client omits them) —
    // persisted alongside the grade; they never affect the FSRS schedule (grade alone drives that).
    // In dev, an X-Sim-Now header threads the SAME simulation clock as /api/due into the schedule.
    var simNow = devMode && http.Request.Headers.ContainsKey("X-Sim-Now") ? (DateTimeOffset?)SimNow(http, clock) : null;
    var result = reviews.Review(userId, req.ItemId, (Rating)req.Grade, req.Correct, req.Confidence, simNow);

    return Results.Ok(new
    {
        itemId = result.ItemId,
        grade = result.Grade.ToString(),
        difficulty = Math.Round(result.Difficulty, 4),
        stability = Math.Round(result.Stability, 4),
        intervalDays = Math.Round(result.IntervalDays, 4),
        elapsedDays = Math.Round(result.ElapsedDays, 4),
        due = result.Due,
        reps = result.Reps,
        lapses = result.Lapses,
        state = result.State.ToString(),
    });
}).RequireRateLimiting(MutatingLimiter);

// ---- GET /api/lessons : catalog ----
app.MapGet("/api/lessons", (LessonStore store) => Results.Ok(store.Summaries));

// ---- GET /api/lessons/{id} : one lesson-as-data, verbatim ----
app.MapGet("/api/lessons/{id}", (string id, LessonStore store) =>
{
    var raw = store.RawJson(id);
    return raw is null
        ? Results.Json(new { error = Strings.LessonNotFound }, statusCode: 404)
        : Results.Content(raw, "application/json");
});

// ---- POST /api/authoring/run-csharp : DEV-ONLY authoring tool (answer-execution) ----
app.MapPost("/api/authoring/run-csharp", async (RunCSharpRequest req) =>
{
    if (!devMode) return Results.Json(new { error = Strings.DevModeDisabled }, statusCode: 403);
    var result = await runner.RunAsync(req.Code ?? "");
    return Results.Ok(new
    {
        success = result.Success,
        stdout = result.Stdout,
        error = result.Error,
        elapsedMs = result.ElapsedMs,
    });
});

// ---- GET /api/dev/sign-initdata : DEV-ONLY helper to produce genuinely signed initData ----
app.MapGet("/api/dev/sign-initdata", (long userId) =>
{
    if (!devMode) return Results.Json(new { error = Strings.DevModeDisabled }, statusCode: 403);
    var initData = TelegramAuth.SignInitData(userId, botToken);
    return Results.Ok(new { initData });
});

// SPA fallback: any route that is not /api/* and not a real file serves index.html,
// so the client-side router handles deep links inside the Mini App.
if (serveFrontend)
    app.MapFallbackToFile("index.html", new StaticFileOptions { FileProvider = frontend! });

app.Run();

/// <summary>Exposed so the test project can drive the app via WebApplicationFactory.</summary>
public partial class Program;
