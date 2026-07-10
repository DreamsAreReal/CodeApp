/**
 * Client-side, user-toggled preferences (persisted to localStorage). Currently
 * a single "reduce motion" switch: it is applied as a class on <html> so CSS can
 * suppress animations/transitions app-wide, on top of the OS `prefers-reduced-motion`
 * media query. Applied once at boot and whenever the user flips it in Profile.
 */
const REDUCED_MOTION_KEY = "codex.reducedMotion";
const REDUCED_MOTION_CLASS = "reduced-motion";

/** Whether the user has opted into reduced motion (client preference). */
export function reducedMotionEnabled(): boolean {
  try {
    return localStorage.getItem(REDUCED_MOTION_KEY) === "1";
  } catch {
    return false;
  }
}

/** Reflect the current preference onto <html> so CSS can respond to it. */
export function applyReducedMotion(on: boolean = reducedMotionEnabled()): void {
  document.documentElement.classList.toggle(REDUCED_MOTION_CLASS, on);
}

/** Persist the preference and apply it immediately. Returns the new value. */
export function setReducedMotion(on: boolean): boolean {
  try {
    localStorage.setItem(REDUCED_MOTION_KEY, on ? "1" : "0");
  } catch {
    /* storage may be unavailable — still apply for this session */
  }
  applyReducedMotion(on);
  return on;
}
