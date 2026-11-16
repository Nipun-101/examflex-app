"use client";

import { useCallback, useEffect, useRef } from "react";
import { pauseAttemptKeepalive } from "@/lib/api/attempts";
import {
  armBackTrap,
  armBeforeUnload,
  armPageHide,
} from "@/lib/mocks/attempt-guards";
import { clearCachedAttempt } from "@/lib/mocks/attempt-storage";

type UseAttemptGuardsOptions = {
  attemptId: string;
  /** Back button was pressed; show the leave confirmation. */
  onBackTrap: () => void;
};

/**
 * Hard-close prompt, keepalive pause on real unload, and a back-button trap.
 * Call `disarm()` right after a successful submit/exit so navigating to results
 * or the exam list is never blocked.
 */
export function useAttemptGuards({
  attemptId,
  onBackTrap,
}: UseAttemptGuardsOptions): { disarm: () => void } {
  const activeRef = useRef(true);
  const onBackTrapRef = useRef(onBackTrap);

  useEffect(() => {
    onBackTrapRef.current = onBackTrap;
  }, [onBackTrap]);

  useEffect(() => {
    const isActive = () => activeRef.current;
    const disposers = [
      armBeforeUnload(window, { isActive }),
      armPageHide(window, {
        isActive,
        onLeave: () => {
          pauseAttemptKeepalive(attemptId);
          // The server clock is frozen now, so the cached payload is stale.
          clearCachedAttempt(attemptId);
        },
      }),
      armBackTrap(window, {
        isActive,
        onBack: () => onBackTrapRef.current(),
      }),
    ];
    return () => disposers.forEach((dispose) => dispose());
  }, [attemptId]);

  const disarm = useCallback(() => {
    activeRef.current = false;
  }, []);

  return { disarm };
}
