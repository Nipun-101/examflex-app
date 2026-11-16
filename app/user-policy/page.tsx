import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalDocument,
  LegalList,
  LegalSection,
  legalLinkClass,
  type LegalNavItem,
} from "@/components/legal/legal-document";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "User Policy",
  description: `Acceptable use guidelines for ${brand.name} — how to use our exam preparation platform responsibly and respectfully.`,
};

const SECTIONS: LegalNavItem[] = [
  { id: "content", title: "Prohibited content" },
  { id: "activities", title: "Prohibited activities" },
  { id: "enforcement", title: "Enforcement" },
  { id: "contact", title: "Contact" },
];

const prohibitedContent = [
  "Sexually explicit, pornographic, or otherwise adult-only material.",
  "Content that may cause harm, injury, emotional distress, or danger to yourself, others, or animals.",
  "Material that could lead to loss or damage of property or personal safety.",
  "Content that targets, exploits, or endangers children in any way.",
  "Anything that breaks applicable laws or encourages unlawful behaviour.",
  "Hateful, violent, abusive, discriminatory, defamatory, harassing, threatening, profane, or otherwise offensive material.",
  "Illegal information, including insider trading details or another party's confidential trade secrets.",
  "Content that infringes intellectual property, privacy, publicity, or other proprietary rights.",
  "Information you are not legally or contractually allowed to share.",
  "Fraudulent, false, misleading, or deceptive content.",
];

const prohibitedActivities = [
  `Copy, frame, mirror, or reuse ${brand.name} branding, logos, layouts, or platform elements without our written permission.`,
  "Access or interfere with non-public areas of our systems, servers, or provider infrastructure.",
  `Probe, scan, or attempt to breach the security of ${brand.name} or our service partners.`,
  "Bypass or disable security, access controls, or content protection measures on the platform.",
  "Scrape, crawl, harvest, or bulk-download content using bots, scripts, or automated tools outside our approved interfaces.",
  "Send spam, unsolicited promotions, chain messages, or other unauthorized solicitations through the platform.",
  `Use hidden metadata, tags, or branding that misrepresents affiliation with ${brand.name}.`,
  `Use ${brand.name} for unauthorized commercial purposes or in ways not permitted by our Terms of Service.`,
  "Forge headers or send communications that misrepresent their origin through our Services.",
  `Reverse engineer, decompile, or disassemble software used to deliver ${brand.name}.`,
  "Disrupt platform availability through viruses, flooding, overloading, or similar attacks.",
  "Collect personal information from other users without their clear consent.",
  `Impersonate another person, organisation, or misrepresent your relationship with ${brand.name}.`,
  "Violate any applicable law, regulation, or exam-board integrity rules while using the platform.",
  "Ask other users for passwords, OTPs, tokens, or other account credentials.",
  "Share your login details with friends, relatives, or anyone else to study from a single account.",
  "Encourage or assist anyone else in carrying out the restricted activities listed above.",
];

export default function UserPolicyPage() {
  return (
    <LegalDocument
      title="User Policy"
      lede={`${brand.name} helps aspirants prepare for NEET, JEE, and related exams online. To keep the platform reliable, fair, and safe for everyone, please use our Services only in ways described in this Acceptable Use Policy.`}
      updated="16 November 2026"
      currentPath="/user-policy"
      sections={SECTIONS}
    >
      <LegalSection id="content" title="Content you must not post or share">
        <p>
          You agree not to upload, publish, or distribute user content on{" "}
          {brand.name} that includes:
        </p>
        <LegalList items={prohibitedContent} />
      </LegalSection>

      <LegalSection id="activities" title="Activities that are not allowed">
        <p>
          When using mock tests, study materials, or any other part of{" "}
          {brand.name}, you agree not to:
        </p>
        <LegalList items={prohibitedActivities} />
      </LegalSection>

      <LegalSection id="enforcement" title="How we enforce this policy">
        <div className="space-y-4 rounded-2xl border border-border bg-primary-soft/50 px-5 py-5 sm:px-6">
          <p>
            {brand.name} may review, remove, or restrict user content at any
            time if we believe it violates this User Policy, our{" "}
            <Link href="/terms" className={legalLinkClass}>
              Terms of Service
            </Link>
            , or applicable law — with or without prior notice.
          </p>
          <p>
            We may also suspend or permanently close accounts when we determine,
            at our sole discretion, that a user has breached these rules.{" "}
            {brand.name} is not liable for actions taken to protect the platform
            and its community.
          </p>
        </div>
      </LegalSection>

      <section id="contact" className="scroll-mt-24 border-t border-border pt-8">
        <h2 className="mb-4 font-display text-xl font-bold text-foreground sm:text-2xl">
          Contact
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Questions about this policy? Contact us at{" "}
          <a href={`mailto:${brand.supportEmail}`} className={legalLinkClass}>
            {brand.supportEmail}
          </a>
          .
        </p>
      </section>
    </LegalDocument>
  );
}
