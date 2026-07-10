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
    int Lapses);

/// <summary>
/// The review flow: read prior FSRS state, advance it by the graded rating over the elapsed days,
/// persist the new schedule, and append the history event. "Now" comes from an injected
/// <see cref="TimeProvider"/> (default <see cref="TimeProvider.System"/>) so elapsed-days — and
/// therefore the whole schedule — is deterministic under test (FakeTimeProvider).
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

    public ReviewResult Review(long userId, string itemId, Rating rating)
    {
        var now = _clock.GetUtcNow();
        var prev = _db.GetReviewState(userId, itemId);

        FsrsState state;
        int reps, lapses;
        double elapsedDays;
        if (prev is null)
        {
            state = _fsrs.ReviewNew(rating);
            reps = 1;
            lapses = rating == Rating.Again ? 1 : 0;
            elapsedDays = 0;
        }
        else
        {
            elapsedDays = prev.LastReview is { } lr ? (now - lr).TotalDays : 0;
            state = _fsrs.Review(new FsrsState(prev.Difficulty, prev.Stability), elapsedDays, rating);
            reps = prev.Reps + 1;
            lapses = prev.Lapses + (rating == Rating.Again ? 1 : 0);
        }

        double intervalDays = _fsrs.IntervalDays(state.Stability);
        var due = now + TimeSpan.FromDays(intervalDays);

        _db.UpsertReviewState(new ReviewState(
            userId, itemId, state.Difficulty, state.Stability, due, reps, lapses, now));
        _db.AppendProgressEvent(new ProgressEvent(userId, itemId, (int)rating, now));

        return new ReviewResult(
            itemId, rating, state.Difficulty, state.Stability, intervalDays, elapsedDays, due, reps, lapses);
    }
}
