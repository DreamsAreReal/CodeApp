namespace Codex.Backend;

/// <summary>Outcome of a single review, ready to serialise back to the client.</summary>
public sealed record ReviewResult(
    string ItemId,
    Rating Grade,
    double Difficulty,
    double Stability,
    double IntervalDays,
    double ElapsedDays,
    DateTimeOffset Due,
    int Reps,
    int Lapses,
    CardState State);

/// <summary>
/// The review flow: read prior FSRS state, advance it by the graded rating over the elapsed days,
/// persist the new schedule, and append the history event. "Now" comes from an injected
/// <see cref="TimeProvider"/> (default <see cref="TimeProvider.System"/>) so elapsed-days — and
/// therefore the whole schedule — is deterministic under test (FakeTimeProvider).
///
/// The next due time is <c>now + interval</c> where the interval comes straight from the FSRS-6
/// scheduler: a minute-scale learning/relearning step (so a mistake resurfaces inside the current
/// session) or a whole-day Review-state interval. This mirrors py-fsrs's
/// <c>card.due = review_datetime + next_interval</c>.
/// </summary>
public sealed class ReviewService
{
    private readonly Database _db;
    private readonly FsrsScheduler _fsrs;
    private readonly TimeProvider _clock;

    public ReviewService(Database db, FsrsScheduler fsrs, TimeProvider clock)
    {
        _db = db;
        _fsrs = fsrs;
        _clock = clock;
    }

    /// <summary>
    /// Grade a review. <paramref name="correct"/> (objective typed-answer outcome) and
    /// <paramref name="confidence"/> (the "уверен?" tap) are OPTIONAL calibration signals appended
    /// to the history event; both default to null so the existing contract is byte-for-byte intact.
    /// </summary>
    public ReviewResult Review(
        long userId, string itemId, Rating rating, bool? correct = null, bool? confidence = null)
    {
        var now = _clock.GetUtcNow();
        var prev = _db.GetReviewState(userId, itemId);

        FsrsState prevState;
        int reps, lapses;
        double elapsedDays;
        if (prev is null)
        {
            prevState = FsrsState.New;
            reps = 1;
            lapses = rating == Rating.Again ? 1 : 0;
            elapsedDays = 0;
        }
        else
        {
            elapsedDays = prev.LastReview is { } lr ? (now - lr).TotalDays : 0;
            prevState = new FsrsState(prev.Difficulty, prev.Stability, prev.State, prev.Step);
            reps = prev.Reps + 1;
            lapses = prev.Lapses + (rating == Rating.Again ? 1 : 0);
        }

        var schedule = _fsrs.Review(prevState, elapsedDays, rating);
        var state = schedule.State;
        double intervalDays = schedule.Interval.TotalDays;
        var due = now + schedule.Interval;

        _db.UpsertReviewState(new ReviewState(
            userId, itemId, state.Difficulty, state.Stability, due, reps, lapses, now,
            state.State, state.Step));
        _db.AppendProgressEvent(new ProgressEvent(userId, itemId, (int)rating, now, correct, confidence));

        return new ReviewResult(
            itemId, rating, state.Difficulty, state.Stability, intervalDays, elapsedDays, due,
            reps, lapses, state.State);
    }
}
