/**
 * Pure render: Scene -> keyed VNode tree. No DOM here — deterministic and
 * unit-testable. Every node/edge gets a stable `key` so the diff can match
 * them across steps (data-join).
 */
import type { DiagramNode, Scene, VNode } from "./types.ts";

function findNode(nodes: DiagramNode[], id: string): DiagramNode | null {
  for (const n of nodes) if (n.id === id) return n;
  return null;
}

export function render(scene: Scene): VNode {
  const kids: VNode[] = [];

  for (const e of scene.edges) {
    const a = findNode(scene.nodes, e.from);
    const b = findNode(scene.nodes, e.to);
    if (!a || !b) continue;
    const x1 = a.x + a.w / 2 + 2;
    const y1 = a.y;
    const x2 = b.x - b.w / 2 - 6;
    const y2 = b.y;
    kids.push({
      tag: "line",
      key: "e:" + e.id,
      attrs: {
        x1,
        y1,
        x2,
        y2,
        "marker-end": scene._marker || "url(#vz-arrow)",
        class: e.accent ? "edge accent" : "edge",
      },
    });
  }

  for (const n of scene.nodes) kids.push(renderNode(n));
  return { tag: "g", key: "root", attrs: {}, children: kids };
}

export function renderNode(n: DiagramNode): VNode {
  const cls = ["node", n.kind, n.accent ? "accent" : "", n.state || "", n.good ? "good" : "", n.ghost ? "ghost" : ""]
    .filter(Boolean)
    .join(" ");
  const children: VNode[] = [];
  const hw = n.w / 2;
  const hh = n.h / 2;

  if (n.kind === "slot") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: n.w, height: n.h, rx: 9, class: "vz-slot" } });
    children.push({ tag: "line", key: "dv", attrs: { x1: -hw + 38, y1: -hh + 5, x2: -hw + 38, y2: hh - 5, class: "vz-div" } });
    children.push({ tag: "text", key: "nm", attrs: { x: -hw + 19, y: 5, "text-anchor": "middle", class: "vz-name" }, text: n.name ?? "" });
    children.push({ tag: "text", key: "vl", attrs: { x: 19, y: 5, "text-anchor": "middle", class: "vz-val" }, text: n.value ?? "" });
  } else if (n.kind === "ref") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: n.w, height: n.h, rx: 9, class: "vz-slot" } });
    children.push({ tag: "line", key: "dv", attrs: { x1: -hw + 38, y1: -hh + 5, x2: -hw + 38, y2: hh - 5, class: "vz-div" } });
    children.push({ tag: "text", key: "nm", attrs: { x: -hw + 19, y: 5, "text-anchor": "middle", class: "vz-name" }, text: n.name ?? "" });
    children.push({ tag: "text", key: "rl", attrs: { x: 8, y: 5, "text-anchor": "middle", class: "vz-reflbl" }, text: n.value ?? "ref" });
    if (!n.value) children.push({ tag: "circle", key: "dot", attrs: { cx: hw - 14, cy: 0, r: 4, class: "vz-refdot" } });
  } else if (n.kind === "obj") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: n.w, height: n.h, rx: 11, class: "vz-obj" } });
    children.push({ tag: "text", key: "tg", attrs: { x: 0, y: -hh + 14, "text-anchor": "middle", class: "vz-tag" }, text: n.typeTag ?? "" });
    children.push({ tag: "text", key: "ov", attrs: { x: 0, y: hh - 9, "text-anchor": "middle", class: "vz-objval" }, text: n.value ?? "" });
  } else if (n.kind === "chip") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: n.w, height: n.h, rx: 7, class: "vz-chip" } });
    children.push({ tag: "text", key: "cv", attrs: { x: 0, y: 5, "text-anchor": "middle", class: "vz-chipval" }, text: n.value ?? "" });
  } else if (n.kind === "gate") {
    children.push({ tag: "rect", key: "bx", attrs: { x: -hw, y: -hh, width: n.w, height: n.h, rx: 11, class: "vz-gate" } });
    children.push({ tag: "text", key: "gl", attrs: { x: 0, y: -hh + 15, "text-anchor": "middle", class: "vz-gatelbl" }, text: n.label ?? "" });
    children.push({ tag: "text", key: "dt", attrs: { x: 0, y: hh - 9, "text-anchor": "middle", class: "vz-gatedt" }, text: n.detail ?? "" });
  }

  return { tag: "g", key: "n:" + n.id, attrs: { transform: `translate(${n.x},${n.y})`, class: cls }, children };
}
