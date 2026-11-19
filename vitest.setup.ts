import "@testing-library/jest-dom/vitest";
import type { AnchorHTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { createElement } from "react";
import { vi } from "vitest";

process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:3000";

vi.mock("next/font/google", () => {
  const font = (name: string) => () => ({
    className: `font-${name}`,
    variable: `--font-${name}`,
    style: { fontFamily: name },
  });

  return {
    Plus_Jakarta_Sans: font("plus-jakarta-sans"),
    Bricolage_Grotesque: font("bricolage-grotesque"),
    Outfit: font("outfit"),
  };
});

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: PropsWithChildren<
    { href: string } & AnchorHTMLAttributes<HTMLAnchorElement>
  >): ReactNode => createElement("a", { href, ...props }, children),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
