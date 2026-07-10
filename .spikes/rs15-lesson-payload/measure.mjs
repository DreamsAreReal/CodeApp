// RS-15 spike: measure the payload weight of ONE expert-density lesson as lesson-as-data.
// Question answered: (1) how heavy is a heavy interactive lesson when shipped as DATA
// (Scene[] JSON) rather than as HTML/JS? (2) how many such lessons fit in DeviceStorage
// (5 MB) and IndexedDB (~500 MB iOS) for offline?
// Method: synthesize a realistic lesson: 7 animated segments (boxing plank = 7),
// each segment = a Recorder-style Scene[] of 6..10 steps over ~8..16 nodes + edges,
// plus prose caption/predict text (expert density). Serialize -> gzip level 9.
// Zero deps. Run: node measure.mjs

import { gzipSync } from 'node:zlib';

// ---- synthesize one Scene (snapshot) of a memory/stack-heap diagram ----
function scene(i, nNodes, withPredict) {
  const nodes = [];
  for (let n = 0; n < nNodes; n++) {
    nodes.push({
      id: `n${n}`,
      kind: n % 3 === 0 ? 'box' : n % 3 === 1 ? 'circle' : 'label',
      x: 40 + (n % 6) * 90,
      y: 60 + Math.floor(n / 6) * 80,
      w: 60, h: 32,
      text: n % 2 ? `field_${n} = 0x${(n * 4096).toString(16)}` : `local_${n}`,
      accent: n === i % nNodes,
      ghost: n === (i + 1) % nNodes,
    });
  }
  const edges = [];
  for (let e = 0; e < Math.min(nNodes - 1, 6); e++) {
    edges.push({ id: `e${e}`, from: `n${e}`, to: `n${(e + 3) % nNodes}`, accent: e === 0 });
  }
  const s = {
    nodes, edges,
    caption: `Step ${i}: the boxed value is copied to the managed heap; the stack slot now holds a reference (REF) that the arrow points along. Note the original value type is left as a ghost.`,
    codeLine: 10 + (i % 12),
  };
  if (withPredict) s.predict = `Before advancing: where will the reference on the stack point after the assignment o = i executes on line ${10 + (i % 12)}?`;
  return s;
}

// ---- one animated segment = Scene[] ----
function segment(stepCount, nNodes) {
  const steps = [];
  for (let i = 0; i < stepCount; i++) steps.push(scene(i, nNodes, i % 2 === 0));
  return steps;
}

// ---- one expert-density lesson: 7 segments (boxing plank), varied sizes ----
function lesson() {
  const segs = [];
  const shapes = [[8, 10], [7, 12], [9, 8], [6, 16], [10, 9], [7, 14], [8, 11]]; // [steps, nodes]
  shapes.forEach(([st, nn], idx) => segs.push({
    id: `seg-${idx}`,
    title: `Segment ${idx + 1}: ${['intro','value-vs-ref','the boxing op','heap layout','unboxing','pitfalls','recap'][idx]}`,
    intro: `A prose intro of a couple of sentences establishing the mental model for this segment, at senior/expert density, referencing CLR internals and the ECMA-335 boxing semantics without dumbing down.`,
    steps: segment(st, nn),
  }));
  return {
    id: 'lesson-boxing',
    version: 3,
    contentHash: 'sha256-placeholder-set-at-build',
    title: 'Boxing & Unboxing in the CLR: value types on the managed heap',
    segments: segs,
  };
}

const one = lesson();
const json = JSON.stringify(one);
const rawBytes = Buffer.byteLength(json, 'utf8');
const gz = gzipSync(Buffer.from(json), { level: 9 }).length;

const totalSteps = one.segments.reduce((a, s) => a + s.steps.length, 0);
const totalNodes = one.segments.reduce((a, s) => a + s.steps.reduce((b, st) => b + st.nodes.length, 0), 0);

console.log('=== RS-15 lesson-as-data payload (one expert-density lesson) ===');
console.log('segments (animated):        ', one.segments.length);
console.log('total steps (scenes):       ', totalSteps);
console.log('total node-snapshots:       ', totalNodes);
console.log('raw JSON:                    %d B (%s KB)', rawBytes, (rawBytes / 1024).toFixed(1));
console.log('gzip level 9:                %d B (%s KB)', gz, (gz / 1024).toFixed(1));
console.log('');
console.log('=== offline capacity (lessons that fit, gzip) ===');
console.log('DeviceStorage 5 MB:         ~%d lessons', Math.floor(5 * 1024 * 1024 / gz));
console.log('IndexedDB ~500 MB (iOS):    ~%d lessons', Math.floor(500 * 1024 * 1024 / gz));
console.log('CloudStorage value 4096 ch: %s (needs sharding: ~%d shards/lesson)',
  gz > 4096 ? 'NO single key' : 'fits', Math.ceil(rawBytes / 4000));
console.log('');
console.log('NOTE: rendered HTML/JS/SVG is generated at runtime by the 1.28KB engine from');
console.log('this data. Shipping DATA (not markup) is what keeps per-lesson weight tiny.');
