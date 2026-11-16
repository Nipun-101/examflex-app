"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type * as MathpixNamespace from "mathpix-markdown-it";

type MathpixModule = typeof MathpixNamespace;

const MathpixContext = createContext<MathpixModule | null>(null);

let cached: MathpixModule | null = null;
let pending: Promise<MathpixModule> | null = null;

/** Dynamic import so the heavy math bundle stays out of the initial chunk. */
export function loadMathpix(): Promise<MathpixModule> {
  if (cached) return Promise.resolve(cached);
  pending ??= import("mathpix-markdown-it").then((mod) => {
    // Injects the MathJax/Mathpix styles. This replaces `MathpixLoader`, which
    // renders "Loading" first and would remount the whole runner under it.
    mod.MathpixMarkdownModel.loadMathJax();
    cached = mod;
    return mod;
  });
  return pending;
}

/** Warm the bundle in the background; failures leave plain text on screen. */
export function preloadMathpix(): void {
  loadMathpix().catch(() => undefined);
}

/** Test seam: forget the loaded module. */
export function resetMathpixCache(): void {
  cached = null;
  pending = null;
}

export function useMathpix(): MathpixModule | null {
  return useContext(MathpixContext);
}

type MathpixBoundaryProps = {
  children: ReactNode;
};

/**
 * Loads Mathpix once and shares it with `MathText`. The tree shape never
 * changes, so children render immediately and are not remounted when formulas
 * upgrade from plain text.
 */
export function MathpixBoundary({ children }: MathpixBoundaryProps) {
  const [api, setApi] = useState<MathpixModule | null>(cached);

  useEffect(() => {
    let live = true;
    loadMathpix()
      .then((loaded) => {
        if (live) setApi(loaded);
      })
      .catch(() => {
        // Plain text stays on screen if the math bundle fails to load.
      });
    return () => {
      live = false;
    };
  }, []);

  return <MathpixContext.Provider value={api}>{children}</MathpixContext.Provider>;
}
