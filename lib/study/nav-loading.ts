import type { MouseEvent as ReactMouseEvent } from "react";
import { STUDY_ROUTE_LOADING_LABEL } from "@/lib/study/loading";

/** Soft Nav alias for the shared route-loading copy. */
export const STUDY_NAV_LOADING_LABEL = STUDY_ROUTE_LOADING_LABEL;

type ClickLike = Pick<
  ReactMouseEvent<HTMLAnchorElement>,
  "metaKey" | "ctrlKey" | "shiftKey" | "altKey" | "button" | "defaultPrevented"
>;

/**
 * Whether a link click should open the study loading overlay for in-app Soft Nav.
 * Skips new-tab / modified clicks, external URLs, and no-op same-route clicks.
 */
export function shouldBeginStudyNavigation(
  event: ClickLike,
  href: string,
  currentPathname: string,
  currentSearch = ""
): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return false;
  }

  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("mailto:")) {
    return false;
  }
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    return false;
  }

  const withoutHash = trimmed.split("#")[0] ?? trimmed;
  const [pathnamePart, searchPart = ""] = withoutHash.split("?");
  const pathname =
    pathnamePart === "" || pathnamePart === undefined
      ? currentPathname
      : pathnamePart;
  const search = searchPart;

  const currentQuery = currentSearch.startsWith("?")
    ? currentSearch.slice(1)
    : currentSearch;

  return pathname !== currentPathname || search !== currentQuery;
}
