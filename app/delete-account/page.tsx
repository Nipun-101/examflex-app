import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalContact,
  LegalDocument,
  LegalList,
  LegalSection,
  legalLinkClass,
  type LegalNavItem,
} from "@/components/legal/legal-document";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Delete your account",
  description: `How to delete your ${brand.name} account and what happens to your data.`,
};

const SECTIONS: LegalNavItem[] = [
  { id: "request", title: "How to delete" },
  { id: "what-happens", title: "What happens when you delete" },
  { id: "google", title: "Google Sign-In" },
  { id: "sign-up-again", title: "Signing up again" },
  { id: "help", title: "Need help" },
];

export default function DeleteAccountPage() {
  return (
    <LegalDocument
      title={`Delete your ${brand.name} account`}
      lede={`Privacy rules and Google OAuth requirements need a clear way to delete an account you created. Use the steps below to request deletion of your ${brand.name} account.`}
      updated="16 November 2026"
      currentPath="/delete-account"
      sections={SECTIONS}
    >
      <LegalSection id="request" title="How to delete">
        <p>
          To delete your {brand.name} account, email support from the email or
          with the mobile number linked to the account:
        </p>
        <LegalList
          items={[
            `Email ${brand.supportEmail} with the subject “Delete my ${brand.name} account”.`,
            "Include the registered mobile number and, if you use Google Sign-In, the Google email on the account.",
            "Confirm that you want the account permanently deleted.",
          ]}
        />
        <p>
          We acknowledge deletion requests within 48 hours and complete deletion
          within a reasonable period after verification, unless the law requires
          us to keep limited records (for example tax invoices).
        </p>
      </LegalSection>

      <LegalSection id="what-happens" title="What happens when you delete">
        <p>
          Your account is marked deleted and deactivated. Login identifiers
          (phone, email, Google link) are released so they are no longer tied to
          that account. Past mock-test attempts and study history stay associated
          with the old account id and are not shown on a later signup.
        </p>
        <p>
          Payment and GST invoice records may be retained for as long as tax law
          requires, currently at least six years, even after account deletion.
          See our{" "}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>{" "}
          for more detail.
        </p>
      </LegalSection>

      <LegalSection id="google" title="Google Sign-In">
        <p>
          Deleting your {brand.name} account does not delete your Google
          account. Separately, you can remove {brand.name}&apos;s access from
          your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className={legalLinkClass}
          >
            Google Account permissions
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="sign-up-again" title="Signing up again">
        <p>
          After deletion, signing in again with the same phone number or Google
          account creates a <strong className="text-foreground">new</strong>{" "}
          {brand.name} student account. It does not restore the deleted profile
          or attempt history.
        </p>
      </LegalSection>

      <LegalSection id="help" title="Need help">
        <p>
          If you cannot complete the request yourself, email support and include
          the phone number or Google email on the account. See also our{" "}
          <Link href="/privacy-policy" className={legalLinkClass}>
            Privacy Policy
          </Link>
          .
        </p>
        <LegalContact />
      </LegalSection>
    </LegalDocument>
  );
}
