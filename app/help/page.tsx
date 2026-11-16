import type { Metadata } from "next";
import Link from "next/link";
import {
  SupportContactCard,
  SupportDocument,
  SupportList,
  SupportSection,
  supportLinkClass,
  type SupportNavItem,
} from "@/components/support/support-document";
import { brand } from "@/lib/brand";
import { SUPPORT_HELP_TOPICS } from "@/lib/support/help-topics";
import { SUPPORT_PATHS } from "@/lib/support/support-links";

export const metadata: Metadata = {
  title: "Help centre",
  description: `Help centre for ${brand.name} — getting started, mock tests, billing, account, and how to reach support.`,
};

const SECTIONS: SupportNavItem[] = [
  { id: "topics", title: "Browse topics" },
  { id: "getting-started", title: "Getting started" },
  { id: "tests-practice", title: "Tests & practice" },
  { id: "plans-billing", title: "Plans & billing" },
  { id: "account-privacy", title: "Account & privacy" },
  { id: "more-help", title: "More help" },
];

export default function HelpCentrePage() {
  return (
    <SupportDocument
      title="Help centre"
      lede={`Find quick answers for using ${brand.name} — from signing in and taking mocks to billing, privacy, and account help.`}
      updated="16 November 2026"
      currentPath={SUPPORT_PATHS.help}
      sections={SECTIONS}
    >
      <SupportSection id="topics" title="Browse topics">
        <div className="grid gap-3 sm:grid-cols-2">
          {SUPPORT_HELP_TOPICS.map((topic) => (
            <a
              key={topic.id}
              href={topic.href}
              className="rounded-2xl border border-border bg-card px-4 py-4 shadow-soft transition-colors hover:border-primary/40"
            >
              <p className="font-semibold text-foreground">{topic.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {topic.summary}
              </p>
            </a>
          ))}
        </div>
      </SupportSection>

      <SupportSection id="getting-started" title="Getting started">
        <p>
          Create or open your {brand.name} account from the login page. You can
          continue with Google or a mobile OTP.
        </p>
        <SupportList
          items={[
            "Use the same Google account or phone number each time you sign in.",
            "After login you land in Today, where daily study actions are listed.",
            "Complete your profile details so we can personalise practice where available.",
          ]}
        />
        <p>
          Prefer short answers? See the{" "}
          <Link href={SUPPORT_PATHS.faqs} className={supportLinkClass}>
            FAQs
          </Link>
          .
        </p>
      </SupportSection>

      <SupportSection id="tests-practice" title="Tests & practice">
        <p>
          Mock tests and practice tools live in the signed-in app. Start an
          attempt when you are ready, submit when finished, then review analysis
          and mistake-book items.
        </p>
        <SupportList
          items={[
            "Use a stable internet connection during timed mocks.",
            "Do not share login credentials — each aspirant should use their own account.",
            "If an attempt fails to save, note the time and email support with screenshots.",
          ]}
        />
      </SupportSection>

      <SupportSection id="plans-billing" title="Plans & billing">
        <p>
          Paid plans unlock extra preparation features. Invoices are issued for
          successful payments. Cancellation and refund rules are in the Terms of
          Service.
        </p>
        <p>
          Read the{" "}
          <Link href="/terms#refunds" className={supportLinkClass}>
            refund policy
          </Link>{" "}
          before writing in about a payment issue.
        </p>
      </SupportSection>

      <SupportSection id="account-privacy" title="Account & privacy">
        <p>
          We explain how account data is handled in the Privacy Policy. To close
          your account, follow the Delete account guide or email support from
          your registered email.
        </p>
        <SupportList
          items={[
            "Privacy Policy — what we collect and how we use it.",
            "Delete account — how to request permanent deletion.",
            "User Policy — acceptable use on the platform.",
          ]}
        />
        <p>
          <Link href="/privacy-policy" className={supportLinkClass}>
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/delete-account" className={supportLinkClass}>
            Delete account
          </Link>
          {" · "}
          <Link href="/user-policy" className={supportLinkClass}>
            User Policy
          </Link>
        </p>
      </SupportSection>

      <SupportSection id="more-help" title="More help">
        <p>
          If these guides do not cover your question, email us. Include your
          registered email or phone, what you were trying to do, and any error
          messages.
        </p>
        <SupportContactCard />
        <p>
          Or go to{" "}
          <Link href={SUPPORT_PATHS.contact} className={supportLinkClass}>
            Contact us
          </Link>{" "}
          for a fuller checklist.
        </p>
      </SupportSection>
    </SupportDocument>
  );
}
