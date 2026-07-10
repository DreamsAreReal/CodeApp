/** Inline line-SVG icons (24x24, stroke=currentColor). No emoji (anti-slop, mid). */
function svgIcon(paths: string, sw = 2): string {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
    sw +
    '" stroke-linecap="round" stroke-linejoin="round">' +
    paths +
    "</svg>"
  );
}

export const ICON: Record<string, string> = {
  warn: svgIcon('<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>', 2),
  why: svgIcon('<path d="M9.5 21h5"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2H14.5c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3z"/>', 1.9),
  cost: svgIcon('<path d="M12 3v18"/><path d="M16 6.5C16 5 14.2 4 12 4S8 5 8 6.5 9.8 9 12 9s4 1 4 2.5S14.2 14 12 14s-4-1-4-2.5"/>', 1.9),
  avoid: svgIcon('<path d="M20 6L9 17l-5-5"/>', 1.9),
  book: svgIcon('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5V6"/>', 1.7),
  ext: svgIcon('<path d="M7 17L17 7M9 7h8v8"/>', 1.9),
  arrowR: svgIcon('<path d="M5 12h13"/><path d="M13 6l6 6-6 6"/>', 2.2),
  check: svgIcon('<path d="M20 6L9 17l-5-5"/>', 3),
  close: svgIcon('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
  spark: '<svg viewBox="0 0 24 24" fill="none"><path d="M14 2.5c.7 3.4 2 4.7 5.4 5.5-3.4.8-4.7 2.1-5.4 5.5-.7-3.4-2-4.7-5.4-5.5 3.4-.8 4.7-2.1 5.4-5.5z" fill="#fff"/><path d="M7.5 12.5c.4 2 1.2 2.8 3.2 3.3-2 .5-2.8 1.3-3.2 3.3-.4-2-1.2-2.8-3.2-3.3 2-.5 2.8-1.3 3.2-3.3z" fill="#fff" opacity=".82"/></svg>',
};
