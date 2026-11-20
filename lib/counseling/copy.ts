import { COUNSELING_EXPERT_NAME } from "@/lib/counseling/constants";

export type CounselingCardCopy = {
  badge: string;
  headline: string;
  body: string;
  cta: string;
  footer: string;
  expertName: string;
  expertRole: string;
  parentsBadge: string;
  thankYouHeadline: string;
  thankYouBody: string;
};

export function counselingExamLabel(examName: string): string {
  const trimmed = examName.trim();
  return trimmed.length > 0 ? trimmed : "ExamFlex";
}

export function buildCounselingCardCopy(examName: string): CounselingCardCopy {
  const exam = counselingExamLabel(examName);
  return {
    badge: `★ PREMIUM · 1:1 WITH OUR ${exam.toUpperCase()} EXPERT`,
    headline: "Talk to someone who’s guided students like you for 10+ years.",
    body: `Book a 1:1 session with our ${exam} expert. Bring your doubts, your score and your questions. Leave with a plan that's yours.`,
    cta: "Book my 1:1 session →",
    footer: "Takes a minute. We'll confirm your slot by email or phone.",
    expertName: COUNSELING_EXPERT_NAME,
    expertRole: `${exam} mentor · 10+ years in the field`,
    parentsBadge: "Parents are welcome to join",
    thankYouHeadline: "Thanks for booking — we’ll get back to you.",
    thankYouBody:
      "We’ve received your 1:1 request. Our team will confirm your slot by email or phone soon.",
  };
}

export function counselingModalSubtitle(examName: string): string {
  const exam = counselingExamLabel(examName);
  return `with ${COUNSELING_EXPERT_NAME} · ${exam} mentor`;
}
