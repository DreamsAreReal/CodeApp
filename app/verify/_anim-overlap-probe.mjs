/**
 * Shared in-page geometry probe for the animation-overlap repro + the extended
 * viz-fit transient checks. Runs INSIDE the browser page.
 *
 * Reads the LIVE, possibly-MID-ANIMATION DOM of one segment's SVG: for every
 * `g.node` it takes the on-screen bounding box in SVG USER UNITS by inverting the
 * current CTM (so a WAAPI transform mid-FLIP is reflected), then reports every pair
 * of node boxes that VISIBLY overlap. A box fully CONTAINED in another is intentional
 * nesting (`at:{in}` — e.g. a field slot inside its DisplayClass obj) and is exempt.
 *
 * Exposed as a plain function-body string so both harnesses can inject it via
 * page.evaluate without a bundler.
 */

/** Returns the source of the in-page measurement fn (see measureSegOverlap below). */
export const PROBE_SRC = measureSegOverlapSrc();

function measureSegOverlapSrc() {
  return `(${measureSegOverlap.toString()})`;
}

/**
 * @param {number} si stage index (0-based) — which segment's .stage to read
 * @param {number} OVL_TOL px tolerance (user units) below which a crossing is "touching"
 * @returns {{segIdx:number, boxes:Array, overlaps:Array}} geometry snapshot
 *
 * OVERLAP = two node boxes cross by > OVL_TOL on BOTH axes AND neither contains the
 * other. Containment (nesting) is exempt. Uses the on-screen box via getBoundingClientRect
 * mapped back into the svg viewBox user space, so it is TRUE during a transition.
 */
function measureSegOverlap(si, OVL_TOL) {
  const stages = document.querySelectorAll(".stage");
  const stage = stages[si];
  if (!stage) return { segIdx: si, boxes: [], overlaps: [], error: "no-stage" };
  const svg = stage.querySelector("svg");
  if (!svg) return { segIdx: si, boxes: [], overlaps: [], error: "no-svg" };

  // Map a client-space rect back into SVG user units via the inverse screen CTM.
  const pt = svg.createSVGPoint();
  const toUser = (clientX, clientY) => {
    pt.x = clientX;
    pt.y = clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: clientX, y: clientY };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };

  const round = (n) => Math.round(n * 100) / 100;
  const vb = svg.viewBox.baseVal; // {x,y,width,height} — the frame the boxes must stay in
  const nodes = svg.querySelectorAll("g.node");
  const boxes = [];
  nodes.forEach((g) => {
    const rect = g.querySelector("rect");
    if (!rect) return;
    const id = g.getAttribute("data-node") || "?";
    // Use the RECT's live client rect: this already includes every transform on the
    // group (the FLIP translate, the enter scale) as rendered THIS frame.
    const r = rect.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    const a = toUser(r.left, r.top);
    const b = toUser(r.right, r.bottom);
    const x0 = Math.min(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    const x1 = Math.max(a.x, b.x);
    const y1 = Math.max(a.y, b.y);
    // opacity: an exit node fading out still occupies space; we DO count it while it is
    // visible (opacity > a small epsilon) because a user SEES the overlap. Fully-faded
    // (opacity ~0) nodes are effectively gone and are skipped.
    let op = 1;
    try {
      op = parseFloat(getComputedStyle(g).opacity);
      if (Number.isNaN(op)) op = 1;
    } catch (e) {
      void e;
    }
    boxes.push({ id, x0, y0, x1, y1, op: round(op) });
  });

  const area = (b) => Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0);
  // GENUINE NESTING (`at:{in}`) exemption: the inner box is fully inside the outer AND
  // MEANINGFULLY SMALLER (≤70% area) — a field slot inside its DisplayClass obj. Two
  // boxes of near-equal size at the same spot are a SWAP (s4 eval→n), NOT nesting, so
  // "contains" deliberately requires the size gap; a coincident swap is reported.
  const NEST_AREA_RATIO = 0.7;
  const contains = (o, i) =>
    o.x0 <= i.x0 + OVL_TOL &&
    o.y0 <= i.y0 + OVL_TOL &&
    o.x1 >= i.x1 - OVL_TOL &&
    o.y1 >= i.y1 - OVL_TOL &&
    area(i) <= area(o) * NEST_AREA_RATIO;
  const OPACITY_VISIBLE = 0.12; // below this a fading node is not visually "there"
  const overlaps = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i];
      const b = boxes[j];
      if (a.op < OPACITY_VISIBLE || b.op < OPACITY_VISIBLE) continue;
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ox > OVL_TOL && oy > OVL_TOL && !contains(a, b) && !contains(b, a)) {
        overlaps.push({ a: a.id, b: b.id, opA: a.op, opB: b.op, over: [round(ox), round(oy)] });
      }
    }
  }

  // CLIP (transient): a visible node box must stay within the segment viewBox even
  // mid-move (a de-collision bow must never push a box out of frame). Generous tol.
  const CLIP_TOL = 2;
  const clips = [];
  for (const bx of boxes) {
    if (bx.op < OPACITY_VISIBLE) continue;
    if (bx.x0 < vb.x - CLIP_TOL || bx.y0 < vb.y - CLIP_TOL || bx.x1 > vb.x + vb.width + CLIP_TOL || bx.y1 > vb.y + vb.height + CLIP_TOL) {
      clips.push({ id: bx.id, box: [round(bx.x0), round(bx.y0), round(bx.x1), round(bx.y1)], vb: [vb.width, vb.height] });
    }
  }
  return { segIdx: si, boxes: boxes.map((x) => ({ id: x.id, op: x.op })), overlaps, clips };
}
