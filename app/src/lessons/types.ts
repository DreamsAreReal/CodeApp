/**
 * Lesson-as-data (rich, expert-density variant of docs/design/lesson-format.md).
 * ONE object drives three things at once: the animations (`segments[].scenes`),
 * the SRS card (`cards[]`, keyed to the backend review item), and the lesson
 * text (hook / mechanism explanations / sources). Add a lesson = add a file.
 *
 * Loop contract: the review item id on the backend is `${lesson.id}/${card.id}`,
 * so `lesson.id` and each `card.id` MUST match the backend seed (seed/lessons/*.json).
 *
 * COMPOSITE-QUOTE CONVENTION (accuracy guard): some verbatim quotes are stitched
 * from NON-adjacent sentences of the same source, joined by an ellipsis inside the
 * guillemets, e.g. «first clause… later clause». These are FROZEN as-is. A future
 * author MUST NOT extend such a composite (adding another «…» hop can silently
 * diverge from the source). Each lesson file that contains composites carries a
 * `// COMPOSITE-QUOTES:` marker block listing them by field locator; grep the repo
 * for `COMPOSITE-QUOTES` to find every one. Do not paraphrase or lengthen them —
 * re-verify against `source.archived` (the pinned Wayback snapshot) instead.
 */
import type { Scene, Zone } from "../engine/index.ts";

export interface Source {
  id: string;
  kind: string;
  org: string;
  title: string;
  url: string;
  date: string;
  /**
   * Frozen provenance: a Wayback Machine snapshot of `url` captured on `date`.
   * MS Learn pages are LIVE and can drift; `archived` pins the exact wording the
   * verbatim quotes were taken from. Optional: a few sources (e.g. the CLRS book,
   * or URLs Wayback could not capture) legitimately have no snapshot.
   */
  archived?: string;
}

export interface IlLine {
  off: string;
  op: string;
  arg: string;
  cmt: string;
}

export interface Claim {
  text: string;
  source: string;
}

export interface Misconception {
  wrong: string;
  /** HTML for the hook section (section 1 of the lesson). */
  hook: string;
  source: string;
}

/** One animated deep-dive: its own mini-animation + mechanism explanation. */
export interface Segment {
  id: string;
  num: string;
  kicker: string;
  title: string;
  viewBox: string;
  zones?: Zone[];
  code?: string[];
  il?: IlLine[];
  predictAt?: number;
  predictQ?: string;
  console?: boolean;
  scenes: Scene[];
  /** HTML: "how + why", verbatim primary-source quotes woven in. */
  explain: string;
  sources: string[];
}

export type CardType = "predict-output" | "find-the-bug" | "compare" | "explain";

/** SRS card — verify is deterministic (real stdout). Drives the FSRS loop. */
export interface Card {
  id: string;
  type: CardType;
  engagementLevel: string;
  /** HTML question. */
  question: string;
  options: string[];
  correctIndex: number;
  xp: number;
  /** HTML feedback. */
  okText: string;
  noText: string;
  verify: { kind: "exec"; run: string; expect: string };
  sourceRefs: string[];
}

export type TakeawayIcon = "why" | "cost" | "avoid";
export interface Takeaway {
  icon: TakeawayIcon;
  k: string;
  v: string;
}

export interface LessonData {
  id: string; // T<track>.M<module>.<slug> — matches backend lessonId
  track: string;
  module: string;
  title: string;
  /** Short kicker shown above the lesson title. */
  kicker: string;
  /** Home path metadata. */
  home: { subtitle: string; icon: LessonIcon; estMinutes: number };
  prereqs: string[];
  depth: number; // 1 intuition · 2 mechanics · 3 spec/edge · 4 expert
  version: string;
  status: "self-pass" | "verified" | "draft";
  sources: Source[];
  spec: Claim[];
  edgeCases: Claim[];
  misconceptions: Misconception[];
  segments: Segment[];
  cards: Card[];
  takeaways: Takeaway[];
  foot: string;
}

/** Icon key for the home topic row (line-SVG, chosen in home.ts). */
export type LessonIcon = "types" | "async" | "collections" | "gc";
