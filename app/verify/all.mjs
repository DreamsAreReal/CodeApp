/**
 * verify:all (F5) — one command that runs the whole authoring-guard suite, or an INCREMENTAL
 * subset for fast per-commit checks.
 *
 *   node verify/all.mjs                       # FULL: 5 browser harnesses + density + fixtures
 *   node verify/all.mjs --lessons A,B,C       # INCREMENTAL: static density lint on the listed
 *                                             #   lessons + the fixture self-test (no browser).
 *
 * The full run needs the backend (:5080) and the vite preview (:4173) up, exactly like the
 * individual harnesses; the incremental run is pure (no backend/browser), so it is cheap enough
 * for every commit while the full browser suite runs on the milestone boundary (design «Инструментарий»).
 * Rate-limit note: run-csharp is 60 POST/min — the exec cards are pre-measured into verify.expect,
 * so this suite never re-hits run-csharp; the browser harnesses pace their own /api/review calls.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const run = (script, args = []) =>
  new Promise((resolve) => {
    const p = spawn(process.execPath, [join(HERE, script), ...args], { stdio: "inherit" });
    p.on("exit", (code) => resolve(code ?? 1));
  });

function lessonsArg() {
  const i = process.argv.indexOf("--lessons");
  return i >= 0 && process.argv[i + 1] ? ["--lessons", process.argv[i + 1]] : null;
}

async function main() {
  const only = lessonsArg();
  const steps = [];

  // The anti-echo + density fixture self-test always runs (proves the lint itself still catches).
  steps.push(["density-fixtures.mjs", []]);
  // Density/anti-echo lint over the selected lessons (or all).
  steps.push(["density.mjs", only ?? []]);

  if (!only) {
    // Full run adds the 5 browser harnesses (E2E + layout + product-readiness).
    for (const h of ["run.mjs", "viz-fit.mjs", "shell.mjs", "new-lessons.mjs", "loop.mjs"]) steps.push([h, []]);
  }

  console.log(`\n===== verify:all ${only ? "[INCREMENTAL --lessons " + only[1] + "]" : "[FULL]"} — ${steps.length} step(s) =====\n`);
  let failed = 0;
  for (const [script, args] of steps) {
    console.log(`\n----- ${script} ${args.join(" ")} -----`);
    const code = await run(script, args);
    if (code !== 0) {
      failed++;
      console.log(`----- ${script} EXIT ${code} (FAIL) -----`);
    }
  }
  console.log(`\n===== verify:all ${failed === 0 ? "ALL GREEN" : failed + " STEP(S) FAILED"} =====`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
