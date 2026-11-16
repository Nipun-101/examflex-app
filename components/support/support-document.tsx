import Link from "next/link";
import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { brand } from "@/lib/brand";
import {
  SUPPORT_NAV,
  type SupportPath,
} from "@/lib/support/support-links";
import { supportMailto } from "@/lib/support/support-mailto";

export type SupportNavItem = {
  id: string;
  title: string;
};

export const supportLinkClass =
  "font-medium text-primary transition-colors hover:text-primary/80";

export type SupportDocumentProps = {
  title: string;
  lede: string;
  updated: string;
  currentPath: SupportPath;
  sections: SupportNavItem[];
  children: ReactNode;
};

export function SupportDocument({
  title,
  lede,
  updated,
  currentPath,
  sections,
  children,
}: SupportDocumentProps) {
  return (
    <>
      <LandingHeader />
      <main className="flex-1 bg-gradient-to-b from-primary-soft/40 via-background to-background">
        <article className="container-x py-8 sm:py-12 lg:py-16">
          <Link
            href="/"
            className={`mb-6 inline-flex text-sm ${supportLinkClass}`}
          >
            ← Back to home
          </Link>

          <nav aria-label="Support pages" className="flex flex-wrap gap-2">
            {SUPPORT_NAV.map((item) => {
              const active = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-soft"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 items-start lg:mt-10 lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-12 xl:gap-16">
            <details className="group rounded-2xl border border-border bg-card shadow-soft lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                On this page
                <span className="text-xs font-medium text-primary group-open:hidden">
                  Show
                </span>
                <span className="hidden text-xs font-medium text-primary group-open:inline">
                  Hide
                </span>
              </summary>
              <ul className="space-y-0.5 px-2 pb-3">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary"
                    >
                      <span className="mt-0.5 text-xs font-semibold tabular-nums text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <nav
              aria-label="On this page"
              className="sticky top-20 hidden lg:block"
            >
              <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-primary">
                On this page
              </p>
              <ul className="max-h-[calc(100vh-6rem)] space-y-0.5 overflow-y-auto pr-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-primary"
                    >
                      <span className="mt-0.5 text-xs font-semibold tabular-nums text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8 min-w-0 lg:mt-0">
              <header className="mb-8 sm:mb-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
                  Support
                </p>
                <h1 className="font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  {lede}
                </p>
                <p className="mt-3 text-sm text-muted-foreground/80">
                  Last updated: {updated}
                </p>
              </header>
              {children}
            </div>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  );
}

export type SupportSectionProps = {
  id: string;
  title: string;
  children: ReactNode;
};

export function SupportSection({ id, title, children }: SupportSectionProps) {
  return (
    <section id={id} className="mb-10 scroll-mt-24 sm:mb-12">
      <h2 className="mb-4 font-display text-xl font-bold text-foreground sm:text-2xl">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </div>
    </section>
  );
}

export function SupportList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export type SupportFaqItemProps = {
  id: string;
  question: string;
  children: ReactNode;
};

export function SupportFaqItem({
  id,
  question,
  children,
}: SupportFaqItemProps) {
  return (
    <details
      id={id}
      className="group scroll-mt-24 rounded-2xl border border-border bg-card shadow-soft open:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-4 text-left text-sm font-semibold text-foreground sm:px-5 sm:text-base [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          aria-hidden
          className="mt-0.5 shrink-0 text-xs font-medium text-primary group-open:hidden"
        >
          Show
        </span>
        <span
          aria-hidden
          className="mt-0.5 hidden shrink-0 text-xs font-medium text-primary group-open:inline"
        >
          Hide
        </span>
      </summary>
      <div className="space-y-3 border-t border-border px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5 sm:text-base">
        {children}
      </div>
    </details>
  );
}

export type SupportContactCardProps = {
  subject?: string;
  body?: string;
};

export function SupportContactCard({
  subject = `${brand.name} support request`,
  body = `Hi ${brand.name} team,\n\n`,
}: SupportContactCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card px-5 py-5 shadow-soft sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">
        Email support
      </p>
      <p className="mt-2 font-semibold text-foreground">{brand.legalName}</p>
      <p className="text-sm text-muted-foreground">{brand.legalAddress}</p>
      <p className="mt-3">
        <a
          href={supportMailto(subject, body)}
          className={`break-all text-base font-semibold sm:text-lg ${supportLinkClass}`}
        >
          {brand.supportEmail}
        </a>
      </p>
      <p className="mt-3 text-sm text-muted-foreground">
        We aim to acknowledge emails within 1–2 business days.
      </p>
    </div>
  );
}
