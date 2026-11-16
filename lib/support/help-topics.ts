import { SUPPORT_PATHS } from "@/lib/support/support-links";

export type SupportHelpTopic = {
  id: string;
  title: string;
  summary: string;
  href: string;
};

export const SUPPORT_HELP_TOPICS: readonly SupportHelpTopic[] = [
  {
    id: "getting-started",
    title: "Getting started",
    summary: "Sign in with Google or mobile OTP and start practising.",
    href: "#getting-started",
  },
  {
    id: "tests-practice",
    title: "Tests & practice",
    summary: "Find mocks, review attempts, and use analysis tools.",
    href: "#tests-practice",
  },
  {
    id: "plans-billing",
    title: "Plans & billing",
    summary: "Understand subscriptions, invoices, cancellations, and refunds.",
    href: "#plans-billing",
  },
  {
    id: "account-privacy",
    title: "Account & privacy",
    summary: "Manage your profile, data choices, and account deletion.",
    href: "#account-privacy",
  },
  {
    id: "still-need-help",
    title: "Still need help?",
    summary: "Email support or browse FAQs for quick answers.",
    href: SUPPORT_PATHS.contact,
  },
] as const;
