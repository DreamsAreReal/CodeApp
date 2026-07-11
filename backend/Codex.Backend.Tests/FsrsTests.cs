using Codex.Backend;

namespace Codex.Backend.Tests;

/// <summary>
/// Unit tests on the FSRS-6 scheduler (a faithful port of py-fsrs 6.3.1). They prove the memory
/// model behaves sensibly — grades move the schedule in the right direction, the forgetting curve
/// is calibrated so R(t = S) == desired retention, and the Learning/Review/Relearning lifecycle
/// transitions match py-fsrs. Exact numeric alignment to py-fsrs is asserted separately by the
/// golden-vector test (FsrsFlowTests), built from executed py-fsrs output.
/// </summary>
public sealed class FsrsTests
{
    private readonly FsrsScheduler _s = new(desiredRetention: 0.9);

    [Fact]
    public void ForgettingCurve_AtStability_EqualsDesiredRetention()
    {
        // R(t = S) must equal the desired retention (0.9). Elapsed days are floored to an integer
        // (py-fsrs uses (now - last).days), so use an integer elapsed == stability.
        double r = _s.Retrievability(elapsedDays: 5.0, stability: 5.0);
        Assert.InRange(r, 0.8999, 0.9001);
    }

    [Fact]
    public void NewCard_HasZeroRetrievability()
    {
        // A never-reviewed card (stability 0) has no retrievability yet (py-fsrs returns 0).
        Assert.Equal(0.0, _s.Retrievability(elapsedDays: 1.0, stability: 0.0));
    }

    [Fact]
    public void Interval_AtDesiredRetention_EqualsStability()
    {
        // With desiredRetention = 0.9, the continuous interval equals stability.
        Assert.InRange(_s.IntervalDays(3.2602), 3.2601, 3.2603);
    }

    [Fact]
    public void ReviewInterval_IsWholeDays_AtLeastOne()
    {
        // Review-state intervals are rounded to whole days and never shorter than a day (py-fsrs).
        Assert.Equal(3, _s.ReviewIntervalDays(3.2602));
        Assert.Equal(1, _s.ReviewIntervalDays(0.2));   // rounds up to the 1-day floor
        Assert.Equal(19, _s.ReviewIntervalDays(19.169023));
    }

    [Fact]
    public void NewCard_StartsInLearning_AndAgainSchedulesAShortStep()
    {
        // A brand-new Again starts in the Learning state at learning-step 0 — a minute-scale
        // interval, so the mistake resurfaces within the current session (not hours later).
        var again = _s.Review(FsrsState.New, elapsedDays: 0, Rating.Again);
        Assert.Equal(CardState.Learning, again.State.State);
        Assert.Equal(0, again.State.Step);
        Assert.True(again.Interval < TimeSpan.FromMinutes(2),
            $"Again in Learning must re-queue within minutes, got {again.Interval.TotalMinutes:0.##} min");

        // A brand-new Good advances one learning step (still sub-day, still Learning).
        var good = _s.Review(FsrsState.New, elapsedDays: 0, Rating.Good);
        Assert.Equal(CardState.Learning, good.State.State);
        Assert.True(good.Interval < TimeSpan.FromDays(1));
        // Good schedules further out than Again.
        Assert.True(good.Interval > again.Interval);
    }

    [Fact]
    public void NewCard_GradesAreMonotonic_AgainLtHardLtGoodLtEasy()
    {
        double again = _s.Review(FsrsState.New, 0, Rating.Again).State.Stability;
        double hard = _s.Review(FsrsState.New, 0, Rating.Hard).State.Stability;
        double good = _s.Review(FsrsState.New, 0, Rating.Good).State.Stability;
        double easy = _s.Review(FsrsState.New, 0, Rating.Easy).State.Stability;
        Assert.True(again < hard && hard < good && good < easy);
    }

    [Fact]
    public void RepeatedGoodWithElapsedTime_GrowsStability_AndGraduatesToReview()
    {
        // New Good -> Learning step 1 (S = S0(Good)). A second Good on the last step graduates the
        // card to Review; a third Good after the interval elapses grows stability further.
        var g0 = _s.Review(FsrsState.New, 0, Rating.Good).State;   // Learning, S = 2.3065
        var g1 = _s.Review(g0, elapsedDays: 0.007, Rating.Good);    // same-day -> Review, short-term
        Assert.Equal(CardState.Review, g1.State.State);

        // Wait until due (whole-day interval), then Good again -> long-term recall growth.
        double elapsed = _s.ReviewIntervalDays(g1.State.Stability);
        var g2 = _s.Review(g1.State, elapsed, Rating.Good);
        Assert.True(g2.State.Stability > g1.State.Stability,
            $"Good after elapsed time must grow stability: {g1.State.Stability:0.###} -> {g2.State.Stability:0.###}");
        Assert.Equal(CardState.Review, g2.State.State);
    }

    [Fact]
    public void AgainInReview_DropsStability_AndEntersRelearning()
    {
        // Graduate a card to Review with two Goods, then an Again in Review drops stability and
        // moves the card into the Relearning state at a minute-scale relearning step.
        var g0 = _s.Review(FsrsState.New, 0, Rating.Good).State;
        var g1 = _s.Review(g0, 0.007, Rating.Good).State;          // Review
        double elapsed = _s.ReviewIntervalDays(g1.Stability);
        var reviewState = _s.Review(g1, elapsed, Rating.Good).State; // still Review, higher S
        double priorStability = reviewState.Stability;

        var lapsed = _s.Review(reviewState, _s.ReviewIntervalDays(priorStability), Rating.Again);
        Assert.Equal(CardState.Relearning, lapsed.State.State);
        Assert.True(lapsed.State.Stability < priorStability,
            $"Again must drop stability: {priorStability:0.###} -> {lapsed.State.Stability:0.###}");
        Assert.True(lapsed.Interval < TimeSpan.FromDays(1),
            "Again in Review re-queues at a minute-scale relearning step");
    }

    [Fact]
    public void Difficulty_StaysWithinBounds_AndAgainRaisesIt()
    {
        var easy = _s.Review(FsrsState.New, 0, Rating.Easy).State;
        var again = _s.Review(FsrsState.New, 0, Rating.Again).State;
        Assert.InRange(easy.Difficulty, 1.0, 10.0);
        Assert.InRange(again.Difficulty, 1.0, 10.0);
        // Again produces a harder card than Easy.
        Assert.True(again.Difficulty > easy.Difficulty);
    }
}
