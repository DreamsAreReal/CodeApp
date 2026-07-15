/**
 * Tiny data-driven highlighter for the synced code panel.
 * Two language branches: C# (the original, untouched behaviour and the default)
 * and Python (keywords / builtins / `#` comments / '…' "…" f"…" strings).
 * The lesson's `lang` field selects the branch — see lessons/types.ts.
 */
import type { LessonLang } from "../lessons/types.ts";

const TYPES = new Set([
  "int", "object", "string", "bool", "double", "var", "void", "long", "short", "byte",
  "char", "float", "decimal", "uint", "struct", "class", "readonly", "new", "ref", "out",
  "in", "static", "public", "private", "return", "null", "this",
]);
const CLASSES = new Set(["Console", "Thread", "List", "IComparable", "N", "Point", "Dictionary", "Span"]);

const PY_KEYWORDS = new Set([
  "def", "class", "return", "yield", "async", "await", "with", "for", "in", "if", "elif",
  "else", "import", "from", "lambda", "None", "True", "False", "del", "try", "except",
  "finally", "raise", "nonlocal", "global", "pass", "not", "and", "or", "is", "as", "while",
]);
const PY_BUILTINS = new Set([
  "print", "len", "range", "isinstance", "type", "id", "int", "str", "list", "dict",
  "set", "tuple", "hash", "next", "iter", "super", "repr",
]);

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hlCsharp(line: string): string {
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

/**
 * Python branch. Tokenization order matters: string literals (incl. f-strings)
 * are matched BEFORE the `#` comment split so a `#` inside quotes never starts
 * a comment; words are then classed as keyword / builtin / plain identifier.
 */
function hlPython(line: string): string {
  const re =
    /([fFrRbB]{0,2}"(?:[^"\\]|\\.)*"|[fFrRbB]{0,2}'(?:[^'\\]|\\.)*')|(#.*$)|([A-Za-z_][A-Za-z0-9_]*)|(\d[\d_]*(?:\.\d+)?)|(\s+)|([^\sA-Za-z0-9_])/g;
  let out = "";
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1]) {
      out += '<span class="tok-str">' + esc(m[1]) + "</span>";
    } else if (m[2]) {
      out += '<span class="tok-cmt">' + esc(m[2]) + "</span>";
    } else if (m[3]) {
      const w = m[3];
      if (PY_KEYWORDS.has(w)) out += '<span class="tok-ty">' + w + "</span>";
      else if (PY_BUILTINS.has(w)) out += '<span class="tok-cls">' + w + "</span>";
      else out += esc(w);
    } else if (m[4]) {
      out += '<span class="tok-num">' + m[4] + "</span>";
    } else if (m[5]) {
      out += m[5];
    } else {
      out += '<span class="tok-pun">' + esc(m[6]) + "</span>";
    }
  }
  return out;
}

export function hlCode(line: string, lang: LessonLang = "csharp"): string {
  return lang === "python" ? hlPython(line) : hlCsharp(line);
}

export { esc };
