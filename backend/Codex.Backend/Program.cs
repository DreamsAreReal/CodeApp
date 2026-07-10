using System.Text.Encodings.Web;
using System.Text.Unicode;
using Codex.Backend;

var builder = WebApplication.CreateBuilder(args);

// ---- configuration ----
var cfg = builder.Configuration;
string botToken = cfg["Telegram:BotToken"] ?? "";
bool devMode = cfg.GetValue("Auth:DevMode", true);
int maxAgeSeconds = cfg.GetValue("Auth:MaxAgeSeconds", 86400);
int runnerTimeout = cfg.GetValue("CSharpRunner:TimeoutSeconds", 10);
string dbPath = Path.Combine(builder.Environment.ContentRootPath, cfg["Database:Path"] ?? "codex.db");
string lessonsDir = Path.Combine(builder.Environment.ContentRootPath, "seed", "lessons");
string[] corsOrigins = cfg.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

// ---- services ----
var db = new Database(dbPath);
var lessons = new LessonStore(lessonsDir);
var fsrs = new FsrsScheduler(desiredRetention: 0.9);
var runner = new CSharpRunner(TimeSpan.FromSeconds(runnerTimeout));

builder.Services.AddSingleton(db);
builder.Services.AddSingleton(lessons);
builder.Services.AddSingleton(fsrs);
builder.Services.AddSingleton(runner);

// Keep Cyrillic (product language: ru) readable in JSON responses instead of \uXXXX escapes.
builder.Services.ConfigureHttpJsonOptions(o =>
    o.SerializerOptions.Encoder = JavaScriptEncoder.Create(UnicodeRanges.All));

builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
{
    if (corsOrigins.Length > 0) p.WithOrigins(corsOrigins);
    else p.AllowAnyOrigin();
    p.AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();
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

// ---- startup: create schema + seed catalog ----
db.Initialize();
foreach (var item in lessons.Items) db.SeedItem(item);

TimeSpan? maxAge = maxAgeSeconds > 0 ? TimeSpan.FromSeconds(maxAgeSeconds) : null;

app.MapGet("/health", () => Results.Ok(new { status = "ok", fsrs = "fsrs-6", storage = "sqlite" }));

// ---- POST /api/auth : validate initData (HMAC), create/return user ----
app.MapPost("/api/auth", (AuthRequest req) =>
{
    // Dev bypass: only when dev mode is on and an explicit dev user id is supplied.
    if (req.DevUserId is { } devId)
    {
        if (!devMode) return Results.Json(new { error = Strings.DevModeDisabled }, statusCode: 403);
        var devUser = db.UpsertUser(devId);
        return Results.Ok(new { userId = devUser.TgId, created = devUser.Created, mode = "dev" });
    }

    var res = TelegramAuth.Validate(req.InitData ?? "", botToken, maxAge);
    if (!res.Ok) return Results.Json(new { error = res.Error }, statusCode: 401);

    var user = db.UpsertUser(res.UserId);
    return Results.Ok(new { userId = user.TgId, created = user.Created, mode = "telegram" });
});

// ---- GET /api/due : items due now for a user ----
app.MapGet("/api/due", (long userId) =>
{
    var now = DateTimeOffset.UtcNow;
    var due = db.GetDue(userId, now);
    return Results.Ok(new { userId, now, count = due.Count, items = due });
});

// ---- GET /api/stats : durable, server-derived home stats (reviews / streak / xp) ----
app.MapGet("/api/stats", (long userId) =>
{
    var (reviewsTotal, streakDays) = db.GetStats(userId, DateTimeOffset.UtcNow);
    return Results.Ok(new
    {
        userId,
        reviewsTotal,
        streakDays,
        xp = reviewsTotal * 10, // 10 XP per completed review (deterministic, history-backed)
    });
});

// ---- POST /api/review : update FSRS state, return next due, append history ----
app.MapPost("/api/review", (ReviewRequest req) =>
{
    if (req.Grade is < 1 or > 4)
        return Results.Json(new { error = Strings.InvalidGrade }, statusCode: 400);

    var rating = (Rating)req.Grade;
    var now = DateTimeOffset.UtcNow;
    var prev = db.GetReviewState(req.UserId, req.ItemId);

    FsrsState state;
    int reps, lapses;
    double elapsedDays;
    if (prev is null)
    {
        state = fsrs.ReviewNew(rating);
        reps = 1;
        lapses = rating == Rating.Again ? 1 : 0;
        elapsedDays = 0;
    }
    else
    {
        elapsedDays = prev.LastReview is { } lr ? (now - lr).TotalDays : 0;
        state = fsrs.Review(new FsrsState(prev.Difficulty, prev.Stability), elapsedDays, rating);
        reps = prev.Reps + 1;
        lapses = prev.Lapses + (rating == Rating.Again ? 1 : 0);
    }

    double intervalDays = fsrs.IntervalDays(state.Stability);
    var due = now + TimeSpan.FromDays(intervalDays);

    db.UpsertReviewState(new ReviewState(
        req.UserId, req.ItemId, state.Difficulty, state.Stability, due, reps, lapses, now));
    db.AppendProgressEvent(new ProgressEvent(req.UserId, req.ItemId, req.Grade, now));

    return Results.Ok(new
    {
        itemId = req.ItemId,
        grade = rating.ToString(),
        difficulty = Math.Round(state.Difficulty, 4),
        stability = Math.Round(state.Stability, 4),
        intervalDays = Math.Round(intervalDays, 4),
        elapsedDays = Math.Round(elapsedDays, 4),
        due,
        reps,
        lapses,
    });
});

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
