import { brand } from "@/lib/brand";
import { SUPPORT_PATHS } from "@/lib/support/support-links";

export type SupportFaq = {
  id: string;
  question: string;
  answer: string;
  hrefs?: ReadonlyArray<{ label: string; href: string }>;
};

export const SUPPORT_FAQS: readonly SupportFaq[] = [
  {
    id: "what-is-examflex",
    question: `What is ${brand.name}?`,
    answer: `${brand.name} is an online NEET and JEE preparation platform with mock tests, practice tools, and performance insights for aspirants across India.`,
  },
  {
    id: "how-to-sign-in",
    question: "How do I create an account or sign in?",
    answer: `You can sign in with Google or with a mobile OTP. Open the login page, choose a method, and continue. By signing in you agree to our Terms of Service and Privacy Policy.`,
    hrefs: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
  {
    id: "mock-tests",
    question: "How do mock tests work?",
    answer:
      "Once you are signed in, open Mocks from the app to start full-length or focused practice. Your attempt history and analysis help you see strengths and gaps over time.",
  },
  {
    id: "payments",
    question: "How do plans and payments work?",
    answer: `Paid plans unlock additional preparation features. Payments are processed securely by our payment partners. For cancellation and refund rules, see the Terms of Service.`,
    hrefs: [{ label: "Refund policy", href: "/terms#refunds" }],
  },
  {
    id: "refunds",
    question: "Can I get a refund?",
    answer: `Refund eligibility depends on the situation described in our refund policy. To request a review, email ${brand.supportEmail} with your registered email or phone and order details.`,
    hrefs: [
      { label: "Refund policy", href: "/terms#refunds" },
      { label: "Contact us", href: SUPPORT_PATHS.contact },
    ],
  },
  {
    id: "delete-account",
    question: "How do I delete my account?",
    answer: `Follow the steps on the Delete account page, or email ${brand.supportEmail} from your registered email with the subject “Delete my ${brand.name} account”.`,
    hrefs: [{ label: "Delete account", href: "/delete-account" }],
  },
  {
    id: "response-time",
    question: "How quickly will support reply?",
    answer:
      "We aim to acknowledge support emails within 1–2 business days. Complex billing or account requests may take longer while we verify details.",
    hrefs: [{ label: "Contact us", href: SUPPORT_PATHS.contact }],
  },
] as const;

export function getSupportFaqIds(): string[] {
  return SUPPORT_FAQS.map((faq) => faq.id);
}
