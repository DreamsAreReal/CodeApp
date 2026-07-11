namespace Codex.Backend;

/// <summary>Review grade. Values match the FSRS rating convention (1..4).</summary>
public enum Rating
{
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

/// <summary>
/// The lifecycle phase of a card, mirroring py-fsrs's <c>State</c> enum. A brand-new card starts
/// in <see cref="Learning"/>; it graduates to <see cref="Review"/> after the learning steps, and
/// an Again in Review drops it into <see cref="Relearning"/> until it graduates again.
/// </summary>
public enum CardState
{
    Learning = 1,
    Review = 2,
    Relearning = 3,
}

/// <summary>
/// Memory + scheduling state of a single item: Difficulty (1..10), Stability (days), the
/// lifecycle <see cref="CardState"/>, and the current learning/relearning <see cref="Step"/>
/// (null once the card is in the Review state). This is the full persisted FSRS state.
/// </summary>
public readonly record struct FsrsState(double Difficulty, double Stability, CardState State, int? Step)
{
    /// <summary>The initial state of a brand-new, never-reviewed card (py-fsrs: <c>Card()</c>).</summary>
    public static FsrsState New => new(0, 0, CardState.Learning, 0);

    /// <summary>True if this card has never been reviewed (no memory state yet).</summary>
    public bool IsNew => Stability == 0;
}

/// <summary>The result of scheduling one review: the new memory/lifecycle state and the next interval.</summary>
public readonly record struct FsrsSchedule(FsrsState State, TimeSpan Interval);

/// <summary>
/// FSRS-6 scheduler — a faithful port of open-spaced-repetition/py-fsrs 6.3.1
/// (<c>fsrs.scheduler.Scheduler</c>; grounded on real py-fsrs execution, see
/// .spikes/rs-fsrs-align/REFERENCE_OUTPUT.txt). Implements the full DSR memory model
/// (Difficulty / Stability / Retrievability) INCLUDING the FSRS-6 short-term terms
/// (w17..w19) and the Learning / Review / Relearning state machine.
///
/// Behaviour matched to py-fsrs, verified against executed reference vectors:
///   * initial S/D; difficulty update with linear damping + mean reversion;
///   * long-term recall-stability growth and forget-stability collapse (across-day);
///   * short-term stability update (same-day / learning / relearning phase);
///   * the FSRS-6 power forgetting curve with parameterised decay (w20), using the
///     INTEGER floor of elapsed days for retrievability (py-fsrs: <c>(now - last).days</c>);
///   * whole-day Review-state intervals (rounded, min 1 day) and minute-scale learning/
///     relearning steps, so a wrong answer (Again) resurfaces within the session.
///
/// DELIBERATE DIFFERENCE vs the py-fsrs default: interval FUZZING is disabled. Fuzzing adds a
/// small random jitter to Review intervals — a client-UX nicety that would make the server's
/// schedule non-deterministic and untestable. Disabling it keeps the golden vectors exact; it
/// only affects the +/-a-few-days jitter of long intervals, never the memory model.
/// </summary>
public sealed class FsrsScheduler
{
    /// <summary>
    /// FSRS-6 default parameters (21 weights), verbatim from py-fsrs 6.3.1
    /// (<c>fsrs.scheduler.DEFAULT_PARAMETERS</c>).
    /// w0..w3 initial stability (Again/Hard/Good/Easy); w4..w5 initial difficulty;
    /// w6..w7 difficulty update; w8..w10 recall-stability; w11..w14 forget-stability;
    /// w15 hard-penalty; w16 easy-bonus; w17..w19 short-term stability; w20 decay.
    /// </summary>
    public static readonly double[] DefaultParameters =
    {
        0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001,
        1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014,
        1.8729, 0.5425, 0.0912, 0.0658, 0.1542,
    };

    /// <summary>
    /// Learning steps (py-fsrs default): a fresh card steps through these minute-scale intervals
    /// before graduating to the Review state. An Again resets to step 0, so a mistake comes back
    /// within a minute — inside the current session — instead of hours later.
    /// </summary>
    public static readonly TimeSpan[] DefaultLearningSteps =
    {
        TimeSpan.FromMinutes(1),
        TimeSpan.FromMinutes(10),
    };

    /// <summary>
    /// Relearning steps (py-fsrs default): after an Again in the Review state the card drops to
    /// Relearning and re-reviews at these minute-scale intervals before graduating back.
    /// </summary>
    public static readonly TimeSpan[] DefaultRelearningSteps =
    {
        TimeSpan.FromMinutes(10),
    };

    private const double StabilityMin = 0.001;
    private const double DifficultyMin = 1.0;
    private const double DifficultyMax = 10.0;
    /// <summary>py-fsrs caps Review-state intervals at 36500 days (100 years).</summary>
    private const int MaximumInterval = 36500;

    private readonly double[] _w;
    private readonly TimeSpan[] _learningSteps;
    private readonly TimeSpan[] _relearningSteps;
    private readonly double _decay;
    private readonly double _factor;

    /// <summary>Target probability of recall at the scheduled due date (default 0.9).</summary>
    public double DesiredRetention { get; }

    public FsrsScheduler(
        double desiredRetention = 0.9,
        double[]? parameters = null,
        TimeSpan[]? learningSteps = null,
        TimeSpan[]? relearningSteps = null)
    {
        _w = parameters ?? DefaultParameters;
        if (_w.Length != 21)
            throw new ArgumentException("FSRS-6 requires exactly 21 parameters.", nameof(parameters));
        _learningSteps = learningSteps ?? DefaultLearningSteps;
        _relearningSteps = relearningSteps ?? DefaultRelearningSteps;
        DesiredRetention = desiredRetention;
        _decay = -_w[20];
        // FACTOR chosen so that R(t = S) == 0.9 exactly (py-fsrs: 0.9 ** (1 / DECAY) - 1).
        _factor = Math.Pow(0.9, 1.0 / _decay) - 1.0;
    }

    /// <summary>
    /// Power forgetting curve R(t) = (1 + FACTOR * t / S) ^ DECAY, where t is the INTEGER floor of
    /// elapsed days (py-fsrs uses <c>(now - last_review).days</c>). Retrievability is 0 for a card
    /// that has never been reviewed.
    /// </summary>
    public double Retrievability(double elapsedDays, double stability)
    {
        if (stability <= 0) return 0.0;
        double t = Math.Max(0.0, Math.Floor(elapsedDays));
        return Math.Pow(1.0 + _factor * t / stability, _decay);
    }

    /// <summary>
    /// Continuous interval (days) after which retrievability decays to DesiredRetention. Used only
    /// as the pre-rounding value for the Review state; see <see cref="ReviewIntervalDays"/> for the
    /// whole-day interval py-fsrs actually schedules.
    /// </summary>
    public double IntervalDays(double stability)
        => stability / _factor * (Math.Pow(DesiredRetention, 1.0 / _decay) - 1.0);

    /// <summary>
    /// The whole-day Review-state interval py-fsrs schedules: the continuous interval rounded to
    /// the nearest day, clamped to at least 1 day and at most the maximum interval.
    /// </summary>
    public int ReviewIntervalDays(double stability)
    {
        double raw = IntervalDays(stability);
        long rounded = (long)Math.Round(raw, MidpointRounding.AwayFromZero);
        return (int)Math.Clamp(rounded, 1, MaximumInterval);
    }

    private double InitialStability(Rating g) => Math.Max(_w[(int)g - 1], StabilityMin);

    // py-fsrs _initial_difficulty(clamp=False) is used inside mean-reversion; clamp=True for storage.
    private double InitialDifficultyRaw(Rating g)
        => _w[4] - Math.Exp(_w[5] * ((int)g - 1)) + 1.0;

    private double InitialDifficulty(Rating g)
        => Clamp(InitialDifficultyRaw(g), DifficultyMin, DifficultyMax);

    private double NextDifficulty(double d, Rating g)
    {
        double deltaD = -_w[6] * ((int)g - 3);
        double damped = d + deltaD * (10.0 - d) / 9.0;                    // linear damping
        double reverted = _w[7] * InitialDifficultyRaw(Rating.Easy)      // mean reversion to D0(Easy), unclamped
                          + (1.0 - _w[7]) * damped;
        return Clamp(reverted, DifficultyMin, DifficultyMax);
    }

    private double NextRecallStability(double d, double s, double r, Rating g)
    {
        double hardPenalty = g == Rating.Hard ? _w[15] : 1.0;
        double easyBonus = g == Rating.Easy ? _w[16] : 1.0;
        double inc = Math.Exp(_w[8]) * (11.0 - d) * Math.Pow(s, -_w[9])
                     * (Math.Exp((1.0 - r) * _w[10]) - 1.0) * hardPenalty * easyBonus;
        return Math.Max(s * (1.0 + inc), StabilityMin);
    }

    private double NextForgetStability(double d, double s, double r)
    {
        double longTerm = _w[11] * Math.Pow(d, -_w[12]) * (Math.Pow(s + 1.0, _w[13]) - 1.0)
                          * Math.Exp((1.0 - r) * _w[14]);
        // FSRS-6 short-term cap: post-lapse stability never exceeds S / exp(w17 * w18).
        double shortTermCap = s / Math.Exp(_w[17] * _w[18]);
        return Math.Max(Math.Min(longTerm, shortTermCap), StabilityMin);
    }

    /// <summary>
    /// FSRS-6 short-term stability update (same-day / learning / relearning phase):
    /// inc = exp(w17 * (g - 3 + w18)) * S^(-w19); for Good/Easy inc is clamped to at least 1.0.
    /// </summary>
    private double ShortTermStability(double s, Rating g)
    {
        double inc = Math.Exp(_w[17] * ((int)g - 3 + _w[18])) * Math.Pow(s, -_w[19]);
        if (g is Rating.Good or Rating.Easy) inc = Math.Max(inc, 1.0);
        return Math.Max(s * inc, StabilityMin);
    }

    /// <summary>
    /// Advance a card by one graded review. <paramref name="prev"/> is the persisted state (use
    /// <see cref="FsrsState.New"/> for a brand-new card); <paramref name="elapsedDays"/> is the time
    /// since the last review (only its integer floor matters, matching py-fsrs); the return carries
    /// the updated state AND the next interval (a minute-scale learning step in the Learning/
    /// Relearning phase, or a whole-day interval in the Review state).
    /// </summary>
    public FsrsSchedule Review(FsrsState prev, double elapsedDays, Rating g)
    {
        // Integer floor of elapsed days, matching py-fsrs's (now - last_review).days.
        int daysSince = prev.IsNew ? -1 : (int)Math.Max(0.0, Math.Floor(elapsedDays));

        return prev.State switch
        {
            CardState.Learning => AdvanceLearning(prev, elapsedDays, daysSince, g, _learningSteps),
            CardState.Relearning => AdvanceLearning(prev, elapsedDays, daysSince, g, _relearningSteps),
            CardState.Review => AdvanceReview(prev, elapsedDays, daysSince, g),
            _ => throw new InvalidOperationException($"Unknown card state: {prev.State}"),
        };
    }

    // Learning and Relearning share identical structure in py-fsrs; only the step table differs.
    private FsrsSchedule AdvanceLearning(
        FsrsState prev, double elapsedDays, int daysSince, Rating g, TimeSpan[] steps)
    {
        int step = prev.Step ?? 0;
        double d, s;

        if (prev.IsNew)
        {
            s = InitialStability(g);
            d = InitialDifficulty(g);
        }
        else if (daysSince >= 0 && daysSince < 1)
        {
            s = ShortTermStability(prev.Stability, g);
            d = NextDifficulty(prev.Difficulty, g);
        }
        else
        {
            double r = Retrievability(elapsedDays, prev.Stability);
            s = g == Rating.Again
                ? NextForgetStability(prev.Difficulty, prev.Stability, r)
                : NextRecallStability(prev.Difficulty, prev.Stability, r, g);
            d = NextDifficulty(prev.Difficulty, g);
        }

        s = Math.Max(s, StabilityMin);

        // Edge case (py-fsrs): no steps, or already past the last step on a non-Again -> graduate.
        if (steps.Length == 0 || (step >= steps.Length && g != Rating.Again))
            return Graduate(d, s);

        switch (g)
        {
            case Rating.Again:
                return new FsrsSchedule(new FsrsState(d, s, prev.State, 0), steps[0]);

            case Rating.Hard:
                TimeSpan hardIvl;
                if (step == 0 && steps.Length == 1) hardIvl = steps[0] * 1.5;
                else if (step == 0 && steps.Length >= 2) hardIvl = (steps[0] + steps[1]) / 2.0;
                else hardIvl = steps[Math.Min(step, steps.Length - 1)];
                return new FsrsSchedule(new FsrsState(d, s, prev.State, step), hardIvl);

            case Rating.Good:
                if (step + 1 == steps.Length) return Graduate(d, s);
                return new FsrsSchedule(new FsrsState(d, s, prev.State, step + 1), steps[step + 1]);

            case Rating.Easy:
                return Graduate(d, s);

            default:
                throw new InvalidOperationException($"Unknown rating: {g}");
        }
    }

    private FsrsSchedule AdvanceReview(FsrsState prev, double elapsedDays, int daysSince, Rating g)
    {
        double d = NextDifficulty(prev.Difficulty, g);
        double s;
        if (daysSince >= 0 && daysSince < 1)
        {
            s = ShortTermStability(prev.Stability, g);
        }
        else
        {
            double r = Retrievability(elapsedDays, prev.Stability);
            s = g == Rating.Again
                ? NextForgetStability(prev.Difficulty, prev.Stability, r)
                : NextRecallStability(prev.Difficulty, prev.Stability, r, g);
        }
        s = Math.Max(s, StabilityMin);

        if (g == Rating.Again)
        {
            // Again in Review -> drop to Relearning (or, with no relearning steps, a whole-day interval).
            if (_relearningSteps.Length == 0)
                return new FsrsSchedule(new FsrsState(d, s, CardState.Review, null), DayInterval(s));
            return new FsrsSchedule(new FsrsState(d, s, CardState.Relearning, 0), _relearningSteps[0]);
        }

        // Hard/Good/Easy in Review -> stay in Review with a whole-day interval.
        return new FsrsSchedule(new FsrsState(d, s, CardState.Review, null), DayInterval(s));
    }

    private FsrsSchedule Graduate(double d, double s)
        => new(new FsrsState(d, s, CardState.Review, null), DayInterval(s));

    private TimeSpan DayInterval(double stability) => TimeSpan.FromDays(ReviewIntervalDays(stability));

    private static double Clamp(double v, double lo, double hi) => Math.Min(Math.Max(v, lo), hi);
}
