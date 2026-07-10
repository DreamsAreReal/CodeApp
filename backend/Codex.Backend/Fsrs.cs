namespace Codex.Backend;

/// <summary>Review grade. Values match the FSRS rating convention (1..4).</summary>
public enum Rating
{
    Again = 1,
    Hard = 2,
    Good = 3,
    Easy = 4,
}

/// <summary>Memory state of a single item: Difficulty (1..10) and Stability (days).</summary>
public readonly record struct FsrsState(double Difficulty, double Stability);

/// <summary>
/// Compact FSRS-6 scheduler (DSR memory model: Difficulty / Stability / Retrievability).
/// Grounded on open-spaced-repetition (py-fsrs DEFAULT_PARAMETERS, FSRS-6; retrieved 2026-07-09).
/// Implements the long-term (across-day) schedule: initial S/D, difficulty update with linear
/// damping + mean reversion, recall-stability growth and forget-stability collapse, and the
/// FSRS-6 power forgetting curve with a parameterised decay (w20).
/// The FSRS-6 same-day short-term terms (w17..w19) are intentionally omitted in this skeleton;
/// see README. This does not affect across-day scheduling, which is what drives the due queue.
/// </summary>
public sealed class FsrsScheduler
{
    /// <summary>
    /// FSRS-6 default parameters (21 weights), verbatim from open-spaced-repetition/py-fsrs.
    /// w0..w3 initial stability (Again/Hard/Good/Easy); w4..w5 initial difficulty;
    /// w6..w7 difficulty update; w8..w10 recall-stability; w11..w14 forget-stability;
    /// w15 hard-penalty; w16 easy-bonus; w17..w19 short-term (unused here); w20 decay.
    /// </summary>
    public static readonly double[] DefaultParameters =
    {
        0.2172, 1.1771, 3.2602, 16.1507, 7.0114, 0.57, 2.0966, 0.0069,
        1.5261, 0.112, 1.0178, 1.849, 0.1133, 0.3127, 2.2934, 0.2191,
        3.0004, 0.7536, 0.3332, 0.1437, 0.2,
    };

    private const double StabilityMin = 0.001;
    private const double DifficultyMin = 1.0;
    private const double DifficultyMax = 10.0;

    private readonly double[] _w;
    private readonly double _decay;
    private readonly double _factor;

    /// <summary>Target probability of recall at the scheduled due date (default 0.9).</summary>
    public double DesiredRetention { get; }

    public FsrsScheduler(double desiredRetention = 0.9, double[]? parameters = null)
    {
        _w = parameters ?? DefaultParameters;
        if (_w.Length != 21)
            throw new ArgumentException("FSRS-6 requires exactly 21 parameters.", nameof(parameters));
        DesiredRetention = desiredRetention;
        _decay = -_w[20];
        // FACTOR chosen so that R(t = S) == 0.9 exactly.
        _factor = Math.Pow(0.9, 1.0 / _decay) - 1.0;
    }

    /// <summary>Power forgetting curve: R(t) = (1 + FACTOR * t / S) ^ DECAY.</summary>
    public double Retrievability(double elapsedDays, double stability)
        => Math.Pow(1.0 + _factor * Math.Max(elapsedDays, 0.0) / stability, _decay);

    /// <summary>Interval (days) after which retrievability decays to DesiredRetention.</summary>
    public double IntervalDays(double stability)
        => stability / _factor * (Math.Pow(DesiredRetention, 1.0 / _decay) - 1.0);

    private double InitialStability(Rating g) => Math.Max(_w[(int)g - 1], StabilityMin);

    private double InitialDifficulty(Rating g)
        => Clamp(_w[4] - Math.Exp(_w[5] * ((int)g - 1)) + 1.0, DifficultyMin, DifficultyMax);

    private double NextDifficulty(double d, Rating g)
    {
        double deltaD = -_w[6] * ((int)g - 3);
        double damped = d + deltaD * (10.0 - d) / 9.0;                    // linear damping
        double reverted = _w[7] * InitialDifficulty(Rating.Easy)         // mean reversion to D0(Easy)
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
        double sf = _w[11] * Math.Pow(d, -_w[12]) * (Math.Pow(s + 1.0, _w[13]) - 1.0)
                    * Math.Exp((1.0 - r) * _w[14]);
        return Math.Max(sf, StabilityMin);
    }

    /// <summary>First review of a brand-new item.</summary>
    public FsrsState ReviewNew(Rating g) => new(InitialDifficulty(g), InitialStability(g));

    /// <summary>Subsequent review of an item that already has memory state.</summary>
    public FsrsState Review(FsrsState prev, double elapsedDays, Rating g)
    {
        double r = Retrievability(elapsedDays, prev.Stability);
        double d = NextDifficulty(prev.Difficulty, g);
        double s = g == Rating.Again
            ? NextForgetStability(prev.Difficulty, prev.Stability, r)
            : NextRecallStability(prev.Difficulty, prev.Stability, r, g);
        return new(d, Math.Max(s, StabilityMin));
    }

    private static double Clamp(double v, double lo, double hi) => Math.Min(Math.Max(v, lo), hi);
}
