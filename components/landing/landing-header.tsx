"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "@/components/landing/brand-mark";

const NAV_LINKS = [
  { href: "#", label: "Home" },
  { href: "#tests", label: "Mocks" },
  { href: "#equation-book", label: "Equation Book" },
  { href: "#mistake-book", label: "Mistake Book" },
  { href: "#performance", label: "Analysis" },
] as const;

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="shrink-0" onClick={() => setOpen(false)}>
          <BrandMark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.label}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                index === 0
                  ? "bg-primary-soft text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
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
                className="rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
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
