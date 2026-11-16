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
import { SUPPORT_PATHS } from "@/lib/support/support-links";

export const metadata: Metadata = {
  title: "Contact us",
  description: `Contact ${brand.name} support at ${brand.supportEmail} for account, billing, and product help.`,
};

const SECTIONS: SupportNavItem[] = [
  { id: "email", title: "Email us" },
  { id: "include", title: "What to include" },
  { id: "timing", title: "Response times" },
  { id: "other", title: "Other resources" },
];

export default function ContactUsPage() {
  return (
    <SupportDocument
      title="Contact us"
      lede={`Reach the ${brand.name} support team for account help, billing questions, technical issues, or feedback.`}
      updated="16 November 2026"
      currentPath={SUPPORT_PATHS.contact}
      sections={SECTIONS}
    >
      <SupportSection id="email" title="Email us">
        <p>
          The fastest way to reach us is email. Write from the address or phone
          number linked to your {brand.name} account whenever possible so we can
          verify your request.
        </p>
        <SupportContactCard />
      </SupportSection>

      <SupportSection id="include" title="What to include">
        <p>A clear email helps us respond faster. Please include:</p>
        <SupportList
          items={[
            "Your registered email address or mobile number.",
            "A short subject line (for example: “Payment not reflected” or “Delete my account”).",
            "What you expected to happen and what you saw instead.",
            "Approximate date and time of the issue, plus screenshots if useful.",
            "For billing: order or invoice reference if you have one.",
          ]}
        />
      </SupportSection>

      <SupportSection id="timing" title="Response times">
        <p>
          We aim to acknowledge support emails within 1–2 business days. Account
          deletion, refund reviews, and payment investigations may take longer
          while we confirm details with payment partners.
        </p>
        <p>
          Urgent exam-day issues should still be emailed — include “Urgent” in
          the subject so we can prioritise triage.
        </p>
      </SupportSection>

      <SupportSection id="other" title="Other resources">
        <p>Before writing in, these pages may already answer your question:</p>
        <SupportList
          items={[
            "Help centre — guided topics for common tasks.",
            "FAQs — short answers to frequent questions.",
            "Terms of Service — payments, cancellation, and refunds.",
            "Privacy Policy — how we handle personal data.",
          ]}
        />
        <p>
          <Link href={SUPPORT_PATHS.help} className={supportLinkClass}>
            Help centre
          </Link>
          {" · "}
          <Link href={SUPPORT_PATHS.faqs} className={supportLinkClass}>
            FAQs
          </Link>
          {" · "}
          <Link href="/terms" className={supportLinkClass}>
            Terms
          </Link>
          {" · "}
          <Link href="/privacy-policy" className={supportLinkClass}>
            Privacy
          </Link>
        </p>
      </SupportSection>
    </SupportDocument>
  );
}
