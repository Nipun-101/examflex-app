/**
 * Browser guards for a live attempt. Each `arm*` returns a disposer. Every
 * handler checks `isActive()` first so a submitted attempt can disarm the
 * guards without waiting for the component to unmount.
 */

type GuardOptions = {
  isActive: () => boolean;
};

/** Native "Leave site?" prompt on refresh/close while the attempt is live. */
export function armBeforeUnload(
  win: Window,
  { isActive }: GuardOptions
): () => void {
  const handler = (event: BeforeUnloadEvent): void => {
    if (!isActive()) return;
    event.preventDefault();
    event.returnValue = "";
  };
  win.addEventListener("beforeunload", handler);
  return () => win.removeEventListener("beforeunload", handler);
}

/**
 * Fires when the page is really going away (refresh, close, tab discard).
 * Used for the keepalive pause: unlike `beforeunload` it does not run when the
 * student cancels the native prompt, so the server clock never freezes under a
 * still-running UI.
 */
export function armPageHide(
  win: Window,
  { isActive, onLeave }: GuardOptions & { onLeave: () => void }
): () => void {
  const handler = (): void => {
    if (!isActive()) return;
    onLeave();
  };
  win.addEventListener("pagehide", handler);
  return () => win.removeEventListener("pagehide", handler);
}

/**
 * Back-button trap: push a dummy history entry so Back lands on it first, then
 * re-arm and ask the student instead of silently leaving.
 */
export function armBackTrap(
  win: Window,
  { isActive, onBack }: GuardOptions & { onBack: () => void }
): () => void {
  win.history.pushState(null, "", win.location.href);
  const handler = (): void => {
    if (!isActive()) return;
    win.history.pushState(null, "", win.location.href);
    onBack();
  };
  win.addEventListener("popstate", handler);
  return () => win.removeEventListener("popstate", handler);
}
