// Baseline: hand-rolled canvas stepper, zero deps.
const c = document.createElement('canvas');
const ctx = c.getContext('2d');
export function drawBox(x, y, label) {
  ctx.strokeRect(x, y, 40, 40);
  ctx.fillText(label, x + 8, y + 24);
}
