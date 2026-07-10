/** Tiny data-driven C# highlighter for the synced code panel. */
const TYPES = new Set([
  "int", "object", "string", "bool", "double", "var", "void", "long", "short", "byte",
  "char", "float", "decimal", "uint", "struct", "class", "readonly", "new", "ref", "out",
  "in", "static", "public", "private", "return", "null", "this",
]);
const CLASSES = new Set(["Console", "Thread", "List", "IComparable", "N", "Point", "Dictionary", "Span"]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function hlCode(line: string): string {
  const ci = line.indexOf("//");
  let codePart = line;
  let comment = "";
  if (ci >= 0) {
    codePart = line.slice(0, ci);
    comment = line.slice(ci);
  }
  const re = /([A-Za-z_][A-Za-z0-9_]*)|(\d+)|(\s+)|([^\sA-Za-z0-9_])/g;
  let out = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(codePart))) {
    if (m[1]) {
      const w = m[1];
      if (TYPES.has(w)) out += '<span class="tok-ty">' + w + "</span>";
      else if (CLASSES.has(w)) out += '<span class="tok-cls">' + w + "</span>";
      else out += esc(w);
    } else if (m[2]) {
      out += '<span class="tok-num">' + m[2] + "</span>";
    } else if (m[3]) {
      out += m[3];
    } else {
      out += '<span class="tok-pun">' + esc(m[4]) + "</span>";
    }
  }
  if (comment) out += '<span class="tok-cmt">' + esc(comment) + "</span>";
  return out;
}

export { esc };
