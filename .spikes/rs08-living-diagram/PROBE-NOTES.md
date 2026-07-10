# RS-08 spike — living-diagram engine (reusable step-render architecture)

Proves the recommended architecture empirically, headless, in Node.

## Files
- `engine.ts` — the reusable engine (zero deps): declarative `Scene` model, pure
  `render(Scene)->VNode`, keyed data-join `diff` (enter/update/exit), `planFlip` (FLIP
  invert transforms, transform/opacity only), `StepPlayer` deterministic scrubber,
  `Recorder` (algorithm-visualizer command-log pattern).
- `demo.ts` — two recipes: `bubbleSortSteps` (array step-trace via Recorder),
  `boxingSteps` (C# value-vs-ref + boxing, Python-Tutor-style boxes-and-arrows).
- `test.mjs` — 7 assertions. `measure`/`out.*` — bundle sizing.

## Run
```
cd .spikes/rs08-living-diagram
node --experimental-strip-types test.mjs     # -> SPIKE RESULT: PASS (7/7)
```

## Results (executed, Node v26.4.0, esbuild 0.28.1)
- 7/7 PASS: deterministic render (12 steps), random-access scrub == fresh goto,
  swap step = pure FLIP (0 enter/exit, >=2 moves), FLIP dx = [-64,+64] (one slot,
  opposite dirs), boxing step introduces heap node+ref via enter, reduced-motion cuts
  all FLIP but keeps all steps, SRS frozen frame serializes standalone.
- Bundle (esbuild --bundle --minify --format=esm --tree-shaking, gzip -9):
  - engine only: **2678 B min / 1276 B gz**
  - engine + 2 demo recipes: 5083 B min / 2037 B gz

## Reference number measured for comparison (existence + real size, unpkg 2026-07-08)
- `@rive-app/canvas@2.38.5`: rive.wasm **1,941,759 B (715,778 B gz)** + rive.js
  336,005 B (72,847 B gz) => ~**789 KB gz runtime**, WASM fetched from unpkg CDN at
  runtime by default (network dependency). => ~600x the hand-rolled engine; unusable
  as the algorithm-viz layer under a <200 KB TMA budget. Fits only designer-authored
  reward micro-animations (Brilliant's actual use), not code-driven algorithm stepping.

## What this does NOT prove (needs a browser)
- Actual 60fps of FLIP on a low-end Android WebView (planner is pure/correct; the DOM
  adapter applying WAAPI transforms is ~15 lines, not measured on-device).
- Screen-reader behaviour of the SVG in Telegram WebView.
