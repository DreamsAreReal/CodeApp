/**
 * The daily-review SESSION queue — the client-side driver of a CONTINUOUS session.
 *
 * A session is not "one card per lesson". The learner starts a session, the queue is built
 * once from the live due list (`/api/due`, ids of the form `${lessonId}/${cardId}`), and each
 * graded card advances to the NEXT due card — its lesson, its card — until the queue is empty.
 * Only then does the flow return home, where the "День закрыт" / empty states become naturally
 * reachable (the due count really dropped to 0), with no test-only forcing.
 *
 * The FSRS schedule on the server stays the single source of truth: the queue is a fixed
 * snapshot of what was due when the session began, so grading (which may re-schedule a card for
 * later today) never makes the session loop forever. `total` is that snapshot size; `position`
 * is the 1-based index of the card currently being answered → the "N из M" progress counter.
 */

export interface SessionItem {
  lessonId: string;
  cardId: string;
}

/** Split a due itemId (`${lessonId}/${cardId}`) at the LAST slash — lesson ids contain dots, not the split. */
export function parseItemId(itemId: string): SessionItem | null {
  const i = itemId.lastIndexOf("/");
  if (i <= 0 || i >= itemId.length - 1) return null;
  return { lessonId: itemId.slice(0, i), cardId: itemId.slice(i + 1) };
}

class SessionQueue {
  private items: SessionItem[] = [];
  private idx = 0; // index of the card currently being answered
  private startTotal = 0; // snapshot size at session start (the M in "N из M")

  /** Begin a session from a live-ordered list of due itemIds. Unparseable ids are skipped. */
  start(itemIds: string[]): void {
    this.items = itemIds.map(parseItemId).filter((x): x is SessionItem => x !== null);
    this.idx = 0;
    this.startTotal = this.items.length;
    this.expose();
  }

  /** True while there is a card to answer (the session is live). */
  get active(): boolean {
    return this.idx < this.items.length;
  }

  /** The card the learner is answering right now, or null if the session is over/empty. */
  get current(): SessionItem | null {
    return this.active ? this.items[this.idx] : null;
  }

  /** 1-based position of the current card in the session ("N" in "N из M"). */
  get position(): number {
    return Math.min(this.idx + 1, this.startTotal);
  }

  /** Total cards this session started with ("M" in "N из M"). */
  get total(): number {
    return this.startTotal;
  }

  /** Advance past the just-graded card. Returns the next card, or null when the queue is empty. */
  advance(): SessionItem | null {
    if (this.idx < this.items.length) this.idx += 1;
    this.expose();
    return this.current;
  }

  /** Abandon the session (e.g. the learner taps "На главную" mid-way). */
  clear(): void {
    this.items = [];
    this.idx = 0;
    this.startTotal = 0;
    this.expose();
  }

  /** Headless/debug surface — real state, no mock. */
  private expose(): void {
    (window as unknown as { __session?: unknown }).__session = {
      active: this.active,
      position: this.position,
      total: this.total,
      current: this.current,
      remaining: Math.max(0, this.items.length - this.idx),
    };
  }
}

export const sessionQueue = new SessionQueue();
