using Codex.Backend;

namespace Codex.Backend.Tests;

/// <summary>
/// Proves the compact FSRS-6 scheduler behaves sensibly: grades change the schedule in the
/// right direction (Good grows the interval, Again drops it) and the forgetting curve is
/// calibrated so R(t = S) == desired retention.
/// </summary>
public sealed class FsrsTests
{
    private readonly FsrsScheduler _s = new(desiredRetention: 0.9);

    [Fact]
    public void ForgettingCurve_AtStability_EqualsDesiredRetention()
    {
        // By construction R(t = S) must equal the desired retention (0.9).
        double r = _s.Retrievability(elapsedDays: 5.0, stability: 5.0);
        Assert.InRange(r, 0.8999, 0.9001);
    }

    [Fact]
    public void Interval_AtDesiredRetention_EqualsStability()
    {
        // With desiredRetention = 0.9, the interval equals stability.
        Assert.InRange(_s.IntervalDays(3.2602), 3.2601, 3.2603);
    }

    [Fact]
    public void NewCard_GoodGivesLongerIntervalThanAgain()
    {
        var good = _s.ReviewNew(Rating.Good);
        var again = _s.ReviewNew(Rating.Again);
        double goodInterval = _s.IntervalDays(good.Stability);
        double againInterval = _s.IntervalDays(again.Stability);

        Assert.True(goodInterval > againInterval,
            $"Good ({goodInterval:0.####}d) must schedule further out than Again ({againInterval:0.####}d)");
        // Grounded on FSRS-6 defaults: S0(Good)=3.2602, S0(Again)=0.2172.
        Assert.InRange(goodInterval, 3.2, 3.3);
        Assert.InRange(againInterval, 0.2, 0.25);
    }

    [Fact]
    public void GradesAreMonotonic_AgainLtHardLtGoodLtEasy()
    {
        double again = _s.ReviewNew(Rating.Again).Stability;
        double hard = _s.ReviewNew(Rating.Hard).Stability;
        double good = _s.ReviewNew(Rating.Good).Stability;
        double easy = _s.ReviewNew(Rating.Easy).Stability;
        Assert.True(again < hard && hard < good && good < easy);
    }

    [Fact]
    public void RepeatedGoodWithElapsedTime_GrowsStability()
    {
        // New Good, then review Good again after the interval elapses -> stability must grow.
        var s0 = _s.ReviewNew(Rating.Good);                 // S ~= 3.26
        double elapsed = _s.IntervalDays(s0.Stability);     // wait until due (~3.26 days)
        var s1 = _s.Review(s0, elapsed, Rating.Good);
        Assert.True(s1.Stability > s0.Stability,
            $"Good after elapsed time must grow stability: {s0.Stability:0.###} -> {s1.Stability:0.###}");

        // A third Good, again waiting for the interval, grows it further.
        double elapsed2 = _s.IntervalDays(s1.Stability);
        var s2 = _s.Review(s1, elapsed2, Rating.Good);
        Assert.True(s2.Stability > s1.Stability);
    }

    [Fact]
    public void AgainAfterRecall_DropsStabilityBelowPrior()
    {
        var s0 = _s.ReviewNew(Rating.Good);                 // S ~= 3.26
        double elapsed = _s.IntervalDays(s0.Stability);
        var lapsed = _s.Review(s0, elapsed, Rating.Again);
        Assert.True(lapsed.Stability < s0.Stability,
            $"Again must drop stability: {s0.Stability:0.###} -> {lapsed.Stability:0.###}");
    }

    [Fact]
    public void Difficulty_StaysWithinBounds_AndAgainRaisesIt()
    {
        var easy = _s.ReviewNew(Rating.Easy);
        var again = _s.ReviewNew(Rating.Again);
        Assert.InRange(easy.Difficulty, 1.0, 10.0);
        Assert.InRange(again.Difficulty, 1.0, 10.0);
        // Again should produce a harder card than Easy.
        Assert.True(again.Difficulty > easy.Difficulty);
    }
}
