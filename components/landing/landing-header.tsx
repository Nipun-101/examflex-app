"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/landing/brand-mark";

const NAV_LINKS = [
  { href: "#", label: "Home" },
  { href: "#equation-book", label: "Equation Book" },
  { href: "#tests", label: "Mocks" },
  { href: "#mistake-book", label: "Mistake Book" },
  { href: "#performance", label: "Analysis" },
] as const;

const ACTIVE_OFFSET = 120;

// Sections can share a row (Mistake Book / Equation Book), so several may
// pass the offset at the same scroll position. Take the one closest to the
// offset, and on a tie keep the current selection if it is among them.
function getActiveHref(current: string): string {
  let best: string[] = [NAV_LINKS[0].href];
  let bestTop = -Infinity;
  for (const link of NAV_LINKS.slice(1)) {
    const el = document.getElementById(link.href.slice(1));
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top > ACTIVE_OFFSET) continue;
    if (top > bestTop + 1) {
      best = [link.href];
      bestTop = top;
    } else if (Math.abs(top - bestTop) <= 1) {
      best.push(link.href);
    }
  }
  return best.includes(current) ? current : (best[0] ?? NAV_LINKS[0].href);
}

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string>(NAV_LINKS[0].href);

  // After a click, keep the clicked link active until the user scrolls
  // manually, so the programmatic scroll can't override it.
  const lockedRef = useRef(false);

  const selectLink = (href: string) => {
    lockedRef.current = true;
    setActiveHref(href);
  };

  useEffect(() => {
    const update = () => {
      if (lockedRef.current) return;
      setActiveHref((current) => getActiveHref(current));
    };
    const unlock = () => {
      lockedRef.current = false;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("wheel", unlock, { passive: true });
    window.addEventListener("touchmove", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("wheel", unlock);
      window.removeEventListener("touchmove", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = link.href === activeHref;
            return (
              <Link
                key={link.label}
                href={link.href}
                aria-current={active ? "location" : undefined}
                onClick={() => selectLink(link.href)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-foreground/80 hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/login"
            className="inline-flex h-10 items-center rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-[filter] hover:brightness-110"
          >
            Sign up free
          </Link>
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-border bg-card px-4 py-4 md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                aria-current={link.href === activeHref ? "location" : undefined}
                className={`rounded-xl px-3 py-3 text-sm font-semibold hover:bg-muted ${
                  link.href === activeHref
                    ? "bg-primary-soft text-primary"
                    : "text-foreground"
                }`}
                onClick={() => {
                  selectLink(link.href);
                  setOpen(false);
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href="/login"
              className="rounded-full border border-border px-4 py-2.5 text-center text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-gradient-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Sign up free
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
