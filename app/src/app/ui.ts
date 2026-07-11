/**
 * Shared shell UI primitives so every screen presents the SAME error, loading and
 * chrome. Centralising these is what makes the app feel finished rather than three
 * screens that each reinvent "something went wrong".
 *
 *  - `errorCard`  — one friendly error surface with a "Повторить" button (id="retry").
 *                   No raw 401/500 ever reaches the user; the technical detail is a dev
 *                   afterthought rendered muted below the human copy.
 *  - `skeleton*`  — shimmer placeholders (NOT a spinner) shaped like the real screen,
 *                   so the layout does not jump when data lands.
 *
 * Every string here routes through strings.ts (RU product language). Colours are tokens.
 */
import { S } from "../strings.ts";
import { ApiError } from "../api/client.ts";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Turn any thrown value into a short technical detail line (never shown as the headline). */
export function errorDetail(e: unknown): string {
  return e instanceof ApiError ? e.message : String(e);
}

/**
 * The single friendly error surface. `detail` is the raw technical string (muted); the
 * headline + body are always the human copy. The retry button carries id="retry" so each
 * screen wires it to re-run its own load.
 */
export function errorCard(detail: string): string {
  return (
    `<div class="err-card" role="alert">` +
    `<span class="err-ic" aria-hidden="true">${ERR_ICON}</span>` +
    `<div class="err-h">${S.errorTitle}</div>` +
    `<div class="err-s">${S.errorBody}</div>` +
    (detail ? `<div class="err-detail mono">${esc(detail)}</div>` : "") +
    `<button class="cta err-retry" id="retry"><span>${S.retry}</span>${RETRY_ICON}</button>` +
    `</div>`
  );
}

/** Home loading skeleton — greet line + hero card + a few topic rows. */
export function skeletonHome(): string {
  return (
    `<div class="sk-greet"><span class="sk sk-line" style="width:46%"></span><span class="sk sk-line sk-sm" style="width:72%"></span></div>` +
    `<div class="sk sk-hero"></div>` +
    `<div class="sk sk-label"></div>` +
    `<div class="sk-path">${skRow()}${skRow()}${skRow()}${skRow()}</div>`
  );
}

/** Progress/Profile loading skeleton — a stack of card blocks. */
export function skeletonScreen(): string {
  return (
    `<div class="sk sk-card sk-tall"></div>` +
    `<div class="sk sk-label"></div>` +
    `<div class="sk sk-card"></div>` +
    `<div class="sk sk-label"></div>` +
    `<div class="sk sk-card"></div>`
  );
}

function skRow(): string {
  return `<div class="sk sk-topic"></div>`;
}

const ERR_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v5"/><path d="M12 16.5h.01"/><path d="M4 5l16 0"/><path d="M6.5 5 5 20h14L17.5 5"/></svg>';
const RETRY_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 1 13.5-3.5L20 9"/><path d="M20 4v5h-5"/></svg>';
