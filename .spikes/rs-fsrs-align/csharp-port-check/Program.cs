using Codex.Backend;

// Replicate py-fsrs "review exactly when due" cadence at the scheduler level (no fuzzing).
// Each review's elapsed time == the previous interval, mirroring reference.py.
var sched = new FsrsScheduler(desiredRetention: 0.9);

void Run(string name, Rating[] grades)
{
    Console.WriteLine($"\nSEQUENCE [{name}]:");
    var state = FsrsState.New;
    double prevIntervalDays = 0;
    for (int i = 0; i < grades.Length; i++)
    {
        double elapsed = i == 0 ? 0 : prevIntervalDays;
        var res = sched.Review(state, elapsed, grades[i]);
        state = res.State;
        double ivlDays = res.Interval.TotalDays;
        prevIntervalDays = ivlDays;
        Console.WriteLine(
            $"  {i,2} {grades[i],6}  ivl_s={res.Interval.TotalSeconds,12:0.0000}  ivl_d={ivlDays,12:0.000000}  " +
            $"S={state.Stability,11:0.000000}  D={state.Difficulty,8:0.0000}  state={state.State,11}  step={state.Step}");
    }
    Console.WriteLine($"  TERMINAL: S={state.Stability:0.000000} D={state.Difficulty:0.000000} state={state.State}");
}

var R = new Dictionary<string, Rating> {
    {"Again",Rating.Again},{"Hard",Rating.Hard},{"Good",Rating.Good},{"Easy",Rating.Easy}};
Rating[] Seq(params string[] s) => s.Select(x => R[x]).ToArray();

Run("Again,Good,Good,Good,Good,Good", Seq("Again","Good","Good","Good","Good","Good"));
Run("Good,Good,Good", Seq("Good","Good","Good"));
Run("Again,Again,Good", Seq("Again","Again","Good"));
Run("Hard,Good,Easy", Seq("Hard","Good","Easy"));
