import type { Metadata } from "next";
import Link from "next/link";
import {
  SupportContactCard,
  SupportDocument,
  SupportFaqItem,
  SupportSection,
  supportLinkClass,
  type SupportNavItem,
} from "@/components/support/support-document";
import { brand } from "@/lib/brand";
import { SUPPORT_FAQS } from "@/lib/support/faqs";
import { SUPPORT_PATHS } from "@/lib/support/support-links";

export const metadata: Metadata = {
  title: "FAQs",
  description: `Frequently asked questions about ${brand.name} accounts, mock tests, payments, refunds, and support.`,
};

const SECTIONS: SupportNavItem[] = [
  { id: "questions", title: "Common questions" },
  { id: "still-stuck", title: "Still stuck?" },
];

export default function FaqsPage() {
  return (
    <SupportDocument
      title="FAQs"
      lede={`Short answers to common questions about ${brand.name}. Open a question for details, or email support if you need a personal reply.`}
      updated="16 November 2026"
      currentPath={SUPPORT_PATHS.faqs}
      sections={SECTIONS}
    >
      <SupportSection id="questions" title="Common questions">
        <div className="space-y-3">
          {SUPPORT_FAQS.map((faq) => (
            <SupportFaqItem
              key={faq.id}
              id={faq.id}
              question={faq.question}
            >
              <p>{faq.answer}</p>
              {faq.hrefs && faq.hrefs.length > 0 ? (
                <p>
                  {faq.hrefs.map((link, index) => (
                    <span key={link.href}>
                      {index > 0 ? " · " : null}
                      <Link href={link.href} className={supportLinkClass}>
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </SupportFaqItem>
          ))}
        </div>
      </SupportSection>

      <SupportSection id="still-stuck" title="Still stuck?">
        <p>
          If your question is not covered here, check the{" "}
          <Link href={SUPPORT_PATHS.help} className={supportLinkClass}>
            Help centre
          </Link>{" "}
          or email us directly.
        </p>
        <SupportContactCard subject={`${brand.name} FAQ follow-up`} />
      </SupportSection>
    </SupportDocument>
  );
}
