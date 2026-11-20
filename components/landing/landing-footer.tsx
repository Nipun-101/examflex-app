import Link from "next/link";
import { BrandMark } from "@/components/landing/brand-mark";
import { APP_DOMAIN } from "@/lib/constants";
import { SUPPORT_PATHS } from "@/lib/support/support-links";

const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Tests", href: "#tests" },
      { label: "Performance", href: "#performance" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: SUPPORT_PATHS.help },
      { label: "Contact us", href: SUPPORT_PATHS.contact },
      { label: "FAQs", href: SUPPORT_PATHS.faqs },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy-policy" },
      { label: "Terms", href: "/terms" },
      { label: "User Policy", href: "/user-policy" },
      { label: "Refunds", href: "/terms#refunds" },
      { label: "Delete account", href: "/delete-account" },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <BrandMark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Rise above cutoffs. Smart NEET &amp; JEE preparation built for
            students across India 🇮🇳
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="text-sm font-semibold text-foreground">
              {column.title}
            </h4>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-x flex flex-col gap-2 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 ExamFlex · {APP_DOMAIN}</p>
          <p>Illustrative data · No admission prediction</p>
        </div>
      </div>
    </footer>
  );
}
