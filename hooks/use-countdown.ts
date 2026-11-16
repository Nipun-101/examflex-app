"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCountdownOptions = {
  paused: boolean;
  /** Fires once when the clock reaches zero while running. */
  onExpire: () => void;
};

type Countdown = {
  secondsLeft: number;
  /** Adopt a server value (resume, next section). Re-arms expiry. */
  reset: (seconds: number) => void;
};

/**
 * Display countdown. The server owns the real clock; this only mirrors it.
 * It is deadline-based (elapsed wall time since the run started), so throttled
 * background tabs do not make it drift.
 */
export function useCountdown(
  initialSeconds: number,
  { paused, onExpire }: UseCountdownOptions
): Countdown {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, initialSeconds)
  );
  const [epoch, setEpoch] = useState(0);
  const secondsRef = useRef(secondsLeft);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    secondsRef.current = secondsLeft;
  }, [secondsLeft]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (paused) return;
    const base = secondsRef.current;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      setSecondsLeft(Math.max(0, base - elapsed));
    }, 1000);
    return () => clearInterval(id);
  }, [paused, epoch]);

  useEffect(() => {
    if (paused || secondsLeft > 0 || expiredRef.current) return;
    expiredRef.current = true;
    onExpireRef.current();
  }, [paused, secondsLeft]);

  const reset = useCallback((seconds: number) => {
    expiredRef.current = false;
    setSecondsLeft(Math.max(0, seconds));
    setEpoch((value) => value + 1);
  }, []);

  return { secondsLeft, reset };
}
