namespace Codex.Backend;

/// <summary>A Telegram user, keyed by their Telegram id (from validated initData).</summary>
public sealed record User(long TgId, DateTimeOffset Created);

/// <summary>A reviewable item in the catalog, derived from a lesson card.</summary>
public sealed record Item(string ItemId, string LessonId, string? Prompt, string? ExpectedOutput);

/// <summary>Durable FSRS memory state per (user, item).</summary>
public sealed record ReviewState(
    long UserId,
    string ItemId,
    double Difficulty,
    double Stability,
    DateTimeOffset Due,
    int Reps,
    int Lapses,
    DateTimeOffset? LastReview);

/// <summary>Append-only history of a single review action.</summary>
public sealed record ProgressEvent(long UserId, string ItemId, int Grade, DateTimeOffset Ts);

// ---- API request DTOs ----

public sealed record AuthRequest(string? InitData, long? DevUserId);

public sealed record ReviewRequest(long UserId, string ItemId, int Grade);

/// <summary>Client report of lesson-viewing progress (segments seen / completion).</summary>
public sealed record LessonProgressRequest(
    long UserId, string LessonId, int SegmentsSeen, int SegmentsTotal, bool Completed);

public sealed record RunCSharpRequest(string Code);
