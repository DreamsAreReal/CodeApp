/**
 * First-run onboarding flag. Persisted client-side (localStorage) so the tasteful
 * "what is this" hero shows exactly ONCE for a brand-new learner and never gets in
 * the way of a returning user. Mirrors settings.ts's storage pattern.
 *
 * The flag is a pure UX affordance (not the source of truth for progress — that lives
 * on the server), so localStorage is the right home: it survives navigation within a
 * session and across normal reloads, and a rare eviction simply re-shows the friendly
 * intro once, which is harmless.
 */
const ONBOARDED_KEY = "codex.onboarded";

/** True once the learner has seen (or dismissed) the first-run onboarding hero. */
export function hasOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Mark onboarding as seen — called when the learner starts a lesson or dismisses the intro. */
export function markOnboarded(): void {
  try {
    localStorage.setItem(ONBOARDED_KEY, "1");
  } catch {
    /* storage may be unavailable — the intro simply re-shows next time, which is fine */
  }
}
