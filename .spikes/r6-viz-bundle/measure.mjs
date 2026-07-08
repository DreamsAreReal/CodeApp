import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync, mkdirSync } from 'node:fs';

const entries = {
  'vanilla (0 deps, canvas)': 'entries/vanilla.js',
  'd3-modular (select+scale+transition+shape+array)': 'entries/d3-modular.js',
  'anime.js v4 (animate+timeline)': 'entries/animejs.js',
  'motion (animate)': 'entries/motion.js',
  'gsap (core default)': 'entries/gsap.js',
  'two.js (full)': 'entries/twojs.js',
  'd3 v7 (full namespace import)': 'entries/d3-full.js',
  'lottie-web (full)': 'entries/lottie.js',
};

mkdirSync('out', { recursive: true });
const rows = [];
for (const [label, entry] of Object.entries(entries)) {
  const outfile = 'out/' + entry.split('/')[1].replace('.js', '.min.js');
  await build({
    entryPoints: [entry], outfile, bundle: true, minify: true,
    format: 'esm', platform: 'browser', treeShaking: true, legalComments: 'none',
    logLevel: 'silent',
  });
  const raw = readFileSync(outfile);
  const gz = gzipSync(raw, { level: 9 });
  rows.push({ label, minKB: (raw.length/1024), gzipKB: (gz.length/1024) });
}
rows.sort((a,b)=>a.gzipKB-b.gzipKB);
const pad = (s,n)=>String(s).padEnd(n);
console.log(pad('LIBRARY (realistic import)',52), pad('MIN (KB)',10), 'GZIP (KB)');
console.log('-'.repeat(75));
for (const r of rows) console.log(pad(r.label,52), pad(r.minKB.toFixed(1),10), r.gzipKB.toFixed(1));
