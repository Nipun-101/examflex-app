"use client";

import { LogOut, Menu, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  StudyButton,
  StudyControlLink,
} from "@/components/study/study-button";
import { StudyWordmark } from "@/components/study/study-wordmark";
import { logout } from "@/lib/auth/tokens";
import {
  APP_NAV_ITEMS,
  PROFILE_HREF,
  isAppNavActive,
} from "@/lib/navigation/app-nav";

export function StudyNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    void logout();
  };

  return (
    <header className="border-b border-study-divider bg-study-canvas">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 lg:px-12 lg:py-5">
        <div className="min-w-0 justify-self-start">
          <StudyWordmark />
        </div>

        <nav
          aria-label="Study"
          className="hidden items-center justify-center gap-1 lg:flex"
        >
          {APP_NAV_ITEMS.map((item) => {
            const active = isAppNavActive(pathname, item.href);

            return (
              <StudyControlLink
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                variant={active ? "ink" : "rail"}
                className={`inline-flex h-[42px] items-center justify-center rounded-[10px] px-4 text-sm font-medium ${
                  active ? "" : "text-study-muted"
                }`.trim()}
              >
                {item.label}
              </StudyControlLink>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <StudyControlLink
            href={PROFILE_HREF}
            variant="surface"
            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-medium"
          >
            <UserRound className="h-4 w-4 shrink-0" aria-hidden />
            <span>Profile</span>
          </StudyControlLink>

          <StudyButton
            variant="surface"
            className="hidden h-[42px] items-center justify-center gap-2 rounded-[10px] px-4 text-sm font-medium lg:inline-flex"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            <span>{loggingOut ? "Logging out…" : "Log out"}</span>
          </StudyButton>

          <StudyButton
            variant="surface"
            className="grid h-[42px] w-[42px] place-items-center rounded-[10px] lg:hidden"
            aria-expanded={open}
            aria-controls="study-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </StudyButton>
        </div>
      </div>

      {open ? (
        <div
          id="study-mobile-nav"
          className="border-t border-study-divider bg-white px-4 py-3 lg:hidden"
        >
          <nav aria-label="Study mobile" className="flex flex-col gap-1">
            {APP_NAV_ITEMS.map((item) => {
              const active = isAppNavActive(pathname, item.href);

              return (
                <StudyControlLink
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  variant={active ? "ink" : "rail"}
                  className={`rounded-[10px] px-3 py-3 text-sm font-medium ${
                    active ? "" : "text-study-muted"
                  }`.trim()}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </StudyControlLink>
              );
            })}
            <StudyButton
              variant="rail"
              className="mt-1 rounded-[10px] px-3 py-3 text-left text-sm font-medium text-study-muted"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Log out"
            >
              <span className="inline-flex items-center gap-2">
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                {loggingOut ? "Logging out…" : "Log out"}
              </span>
            </StudyButton>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
