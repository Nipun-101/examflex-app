"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useOptionalStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";
import {
  shouldBeginStudyNavigation,
  STUDY_NAV_LOADING_LABEL,
} from "@/lib/study/nav-loading";

export type StudyNavLinkProps = {
  href: string;
  children: ReactNode;
  /** Overlay label while Soft Nav is in flight. */
  loadingLabel?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
} & Omit<ComponentProps<typeof Link>, "href" | "onClick" | "children">;

/**
 * Next.js Link that opens the shared study loading overlay for in-app navigations.
 * Outside StudyLoadingProvider it behaves like a normal Link.
 */
export function StudyNavLink({
  href,
  children,
  className,
  onClick,
  loadingLabel = STUDY_NAV_LOADING_LABEL,
  ...rest
}: StudyNavLinkProps) {
  const loading = useOptionalStudyLoadingOverlay();
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    const currentSearch =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    if (
      !loading ||
      !shouldBeginStudyNavigation(event, href, pathname, currentSearch)
    ) {
      return;
    }
    loading.hold(STUDY_LOADING_HOLD.softNav, { label: loadingLabel });
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      {...(className !== undefined ? { className } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}
