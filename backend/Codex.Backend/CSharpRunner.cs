using System.Diagnostics;
using Microsoft.CodeAnalysis.CSharp.Scripting;
using Microsoft.CodeAnalysis.Scripting;

namespace Codex.Backend;

public sealed record RunResult(bool Success, string Stdout, string? Error, long ElapsedMs);

/// <summary>
/// AUTHORING tool: compiles + runs a C# snippet (Roslyn CSharpScript) and captures stdout.
/// Used at authoring time to compute the ground-truth answer of a card (the answer-execution
/// gate, RS-10 §3.3) — NOT user-facing.
///
/// SECURITY: this executes arbitrary C# in-process with no isolation. It is DEV-ONLY.
/// In production this MUST run inside a sandbox (separate process / container, CPU + memory +
/// wall-clock limits, no network, no filesystem). See README.
/// </summary>
public sealed class CSharpRunner
{
    // Console.Out is process-global, so runs are serialised.
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly TimeSpan _timeout;

    public CSharpRunner(TimeSpan timeout) => _timeout = timeout;

    public async Task<RunResult> RunAsync(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            return new RunResult(false, "", Strings.EmptyCode, 0);

        var options = ScriptOptions.Default
            .WithImports("System", "System.Collections.Generic", "System.Linq", "System.Text")
            .WithReferences(
                typeof(object).Assembly,
                typeof(Enumerable).Assembly,
                typeof(Console).Assembly);

        var sw = new Stopwatch();
        await _gate.WaitAsync();
        var originalOut = Console.Out;
        var captured = new StringWriter();
        try
        {
            Console.SetOut(captured);
            using var cts = new CancellationTokenSource(_timeout);
            sw.Start();
            try
            {
                await CSharpScript.RunAsync(code, options, cancellationToken: cts.Token);
                sw.Stop();
                return new RunResult(true, captured.ToString(), null, sw.ElapsedMilliseconds);
            }
            catch (CompilationErrorException ex)
            {
                sw.Stop();
                return new RunResult(false, captured.ToString(),
                    string.Join("\n", ex.Diagnostics), sw.ElapsedMilliseconds);
            }
            catch (OperationCanceledException)
            {
                sw.Stop();
                return new RunResult(false, captured.ToString(),
                    $"Execution timed out after {_timeout.TotalSeconds:0.#}s.", sw.ElapsedMilliseconds);
            }
            catch (Exception ex)
            {
                sw.Stop();
                // Runtime exception thrown by the snippet itself (e.g. InvalidCastException).
                return new RunResult(false, captured.ToString(),
                    $"{ex.GetType().Name}: {ex.Message}", sw.ElapsedMilliseconds);
            }
        }
        finally
        {
            Console.SetOut(originalOut);
            _gate.Release();
        }
    }
}
