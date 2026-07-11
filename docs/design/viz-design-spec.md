# Viz design spec (living-diagram engine) — grounded rules

Derived from a research pass (diagram design · UI/UX layout · SVG connectors) → concrete,
numeric rules for the SVG living-diagram engine. Fixes reported issues: inconsistent box
sizes ("one huge, one tiny"), content overflow, ugly diagonal "Z" arrows.

## Grid
- `GRID = 2` user-units; `snap(v)=Math.round(v/2)*2` (crisp H/V strokes). Author grid = **4** (prefer 8): every node `x/y/w/h` a multiple of 4/8.
- viewBox stays `0 0 340 210`; SVG must set `preserveAspectRatio="xMidYMid meet"` + `shape-rendering="geometricPrecision"`.

## Node size scale (one type = one height; width from a ladder)
- HEIGHTS by kind: `chip=28, slot=40, ref=40, obj=44, gate=48`. 2-line variants: chip=44, box=60.
- WIDTH ladder: `{56, 72, 96, 120, 144, 168}` (≥25% steps). Auto-size: `needed = ceil((measuredText + 2*PADX)/8)*8`, clamp to nearest rung ≥ needed, cap 168; if text still > 168 → 2-line wrap or shrink (fitLabels floor 0.74). `PADX=8` (obj/chip/gate). slot/ref keep the 38u name gutter.
- Kills "one huge/one tiny": collapse today's 30..312 (40+ distinct widths) to 6 rungs.

## Edge routing — ORTHOGONAL (kills the diagonal "Z")
Replace the straight center-to-center `<line>` with a rounded orthogonal `<path>`:
1. Ports on box EDGES (not centers): E/W/N/S from center±half-size.
2. Pick port pair by dominant axis of center-delta: `|dx|≥|dy|` → horizontal flow (E→W); else vertical (S→N), facing the target.
3. ≤2 bends (max 3): horizontal → `M ax,ay H midX V by H bx`, `midX=snap((ax+bx)/2)`. First/last straight segment ≥ 12u before a jog.
4. Round corners with arc `A r r 0 0 sweep`, `r=6` clamped to half the shorter adjacent segment.
5. STRAIGHT exception: ports colinear (|Δ|≤2) → plain straight segment (no jog).
6. Arrowhead tip sits ON the target border (marker refX at tip), not under the box.

## Alignment
- Same ROW → identical center-Y AND height. Same COLUMN → identical center-X. Target ≤4 distinct x-centers and ≤4 y-centers per scene; no "almost aligned" (61 vs 64 → pick one).
- Snap all coords at author-normalize time; ports derive from snapped centers → straight flow lines.
- Zones fully contain their nodes with ≥8u padding on every side (no node edge within 8u of a zone border).

## Spacing / radius / stroke
- Spacing tokens: `{8,12,16,24,40,48}`. PADX=8; cross-flow gutter=16; along-flow gutter=40. Internal pad ≤ external gap.
- Corner radius by kind: `chip=6, slot=8, ref=8, obj=8, gate=10, zone=12` (one rx per kind).
- Stroke: box kinds `1.5`; accent = same width + coral-d COLOR (not thicker); zone `1.2`; edges `2` (optional links dashed by pattern, not thickness).

## Engine changes
- `render.ts`: `routeEdge(a,b)` orthogonal rounded `<path>` (ports + colinear-straight exception); `snap()` guard on all rect/path coords; `KIND_RX` map; `sizeNode(node, measure)` auto-deriving w (ladder) + h (kind) from content (mono advance ≈0.6·fontSize; canvas for Rubik) when w/h omitted; explicit w/h still snapped+clamped to ladder.
- `vizPlayer.ts`: `preserveAspectRatio="xMidYMid meet"` + `shape-rendering="geometricPrecision"`; zone rx 14→12; marker tip on port. fitLabels stays as last-resort shrink.
- `types.ts`: `w?`,`h?` optional; `DiagramEdge.route?:'ortho'|'straight'` (default ortho).

## Lesson changes
- Normalize every scene's node w/h to ladder+kind-height (or omit and let `sizeNode` derive); snap x/y to /4; align rows to a shared center-Y; reduce distinct centers to ≤4; keep zones ≥8u around nodes. Same pass for all 6 lessons (uniform).

## Verification (extend verify/viz-fit.mjs; keep FIT/CLIP/OVERLAP)
HEIGHT-IN-SCALE · WIDTH-ON-LADDER · GRID-SNAP (v%2==0) · EDGE-ORTHOGONAL (each drawn segment axis-aligned except arcs, or single straight when endpoints share x/y) · EDGE-PORT-ON-BORDER · BEND-COUNT ≤3 · ROW-BASELINE (near-equal center-Y ⇒ identical y+height) · RX-CONSISTENT per kind · STROKE-CONSISTENT per class.
