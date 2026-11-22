export const APP_NAV_ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/equation-book", label: "Equation Book" },
  { href: "/mocks", label: "Mocks" },
  { href: "/mistake-book", label: "Mistake Book" },
  { href: "/analysis", label: "Analysis" },
] as const;

export type AppNavHref = (typeof APP_NAV_ITEMS)[number]["href"];

export const PROFILE_HREF = "/profile" as const;

export function isAppNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
