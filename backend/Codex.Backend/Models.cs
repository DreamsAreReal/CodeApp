namespace Codex.Backend;

/// <summary>A Telegram user, keyed by their Telegram id (from validated initData).</summary>
public sealed record User(long TgId, DateTimeOffset Created);

/// <summary>A reviewable item in the catalog, derived from a lesson card. <see cref="Ord"/> is the
/// curriculum-order key (Section.order → lesson order → card index) used to release never-reviewed
/// cards deterministically under the daily new-card limit (ADR-0002).</summary>
public sealed record Item(string ItemId, string LessonId, string? Prompt, string? ExpectedOutput, int Ord = 0);

/// <summary>
/// Durable FSRS memory state per (user, item). <see cref="State"/> and <see cref="Step"/> carry the
/// FSRS-6 Learning/Review/Relearning lifecycle (see <see cref="CardState"/>); <see cref="Step"/> is
/// null once the card is in the Review state.
/// </summary>
public sealed record ReviewState(
    long UserId,
    string ItemId,
    double Difficulty,
    double Stability,
    DateTimeOffset Due,
    int Reps,
    int Lapses,
    DateTimeOffset? LastReview,
    CardState State,
    int? Step);

/// <summary>
/// Append-only history of a single review action. <see cref="Correct"/> (objective typed-answer
/// outcome) and <see cref="Confidence"/> (the "уверен?" tap) are OPTIONAL calibration signals:
/// null for MCQ cards / older clients, and excluded from the calibration rollup when null.
/// </summary>
public sealed record ProgressEvent(
    long UserId, string ItemId, int Grade, DateTimeOffset Ts,
    bool? Correct = null, bool? Confidence = null);

// ---- API request DTOs ----

public sealed record AuthRequest(string? InitData, long? DevUserId);

// userId is NOT a request field: the server derives it from the validated session token
// (see AuthMiddleware). Accepting it from the client would reopen the IDOR hole.
//
// Correct/Confidence are OPTIONAL calibration fields (default null): `Correct` is the objective
// typed-answer outcome, `Confidence` is the "уверен?" tap. Omitting them keeps the exact old
// contract (nothing breaks for MCQ cards or older clients).
public sealed record ReviewRequest(string ItemId, int Grade, bool? Correct = null, bool? Confidence = null);

/// <summary>Client report of lesson-viewing progress (segments seen / completion).</summary>
public sealed record LessonProgressRequest(
    string LessonId, int SegmentsSeen, int SegmentsTotal, bool Completed);

public sealed record RunCSharpRequest(string Code);
