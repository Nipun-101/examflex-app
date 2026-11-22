/**
 * Ref-counted body scroll lock.
 *
 * Several layers can lock scrolling at once (a bottom sheet, then the route
 * loading overlay on top of it). Each saving/restoring `body.style.overflow`
 * on its own breaks when they unmount out of order: the overlay captures
 * "hidden" as its "previous" value and writes it back last, leaving the page
 * permanently unscrollable. A shared counter restores the original value only
 * when the last lock is released.
 */
let lockCount = 0;
let originalOverflow = "";

/** Locks body scrolling; returns an idempotent release function. */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (lockCount === 0) {
    originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) document.body.style.overflow = originalOverflow;
  };
}
