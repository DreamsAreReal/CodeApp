/**
 * Shared helpers for the headless verification harnesses.
 *
 * evidenceDir(name) — resolve the directory PNG evidence is written to. It is CI-portable:
 *   1) $EVIDENCE_DIR (optionally suffixed with `name`) — set by the workflow to a writable
 *      path under the runner temp, so the harness never tries to mkdir a developer's macOS
 *      home on a Linux runner;
 *   2) otherwise a repo-relative `docs/evidence[/<name>]` resolved from this file's location
 *      (works on any checkout, any OS), created on demand.
 * No absolute developer path is ever hardcoded, so the same script runs on macOS and Linux CI.
 *
 * preflight() — before doing any browser work, confirm the backend (:5080) and the vite
 * preview (:4173) are actually reachable. If either is down we print ONE clean line and
 * exit(1) instead of letting Playwright/fetch crash with a raw ERR_CONNECTION_REFUSED stack.
 */
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url)); // app/verify
// Repo root evidence root = <repo>/docs/evidence (app/verify -> app -> repo).
const REPO_EVIDENCE = resolve(HERE, "..", "..", "docs", "evidence");

/**
 * Resolve + create the evidence directory for a harness.
 * @param {string} [name] optional sub-folder (e.g. "shell", "viz-fit"); omit for the root.
 * @returns {string} an absolute, existing directory path.
 */
export function evidenceDir(name) {
  const base = process.env.EVIDENCE_DIR && process.env.EVIDENCE_DIR.trim()
    ? process.env.EVIDENCE_DIR.trim()
    : REPO_EVIDENCE;
  const dir = name ? join(base, name) : base;
  mkdirSync(dir, { recursive: true });
  return dir;
}

const API_DEFAULT = process.env.VITE_API_BASE || "http://localhost:5080";
const APP_DEFAULT = process.env.APP_BASE || "http://localhost:4173";

async function reachable(url, timeoutMs = 4000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    await fetch(url, { signal: ctl.signal });
    return true; // any HTTP answer (even 4xx/5xx) proves the socket is up
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

/**
 * Fail fast with a clean, human message if the backend and/or preview are not up.
 * @param {{ api?: string, app?: string }} [opts] override the health URLs.
 */
export async function preflight(opts = {}) {
  const api = opts.api || API_DEFAULT;
  const app = opts.app || APP_DEFAULT;
  const [apiUp, appUp] = await Promise.all([
    reachable(api + "/health/live"),
    reachable(app + "/"),
  ]);
  if (apiUp && appUp) return;
  const down = [];
  if (!apiUp) down.push(`backend ${api}`);
  if (!appUp) down.push(`preview ${app}`);
  console.error(
    `  ✗ preflight: ${down.join(" + ")} не подняты — подними backend (\`dotnet run\`, :5080) ` +
      `и preview (\`npm run preview\`, :4173), затем повтори.`,
  );
  process.exit(1);
}
