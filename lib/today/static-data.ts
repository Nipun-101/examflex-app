import type { TodayPageData } from "@/types/today";

/** Static Today dashboard content — replace with API payload later. */
export const TODAY_PAGE_DATA: TodayPageData = {
  eyebrow: "YOUR STUDY SPACE",
  headline: "One good step at a time.",
  subhead: "Not more things to study. A clearer idea of what to do next.",
  paceBadge: "examflex  /  Your pace, your plan",
  nextStep: {
    eyebrow: "PICK UP WHERE YOU LEFT OFF",
    title: "Your mistakes have a next chapter.",
    body: "19 questions left to review from Mock 12. Start with 5 today.",
    ctaLabel: "Open Mistake Book  →",
    ctaHref: "/mistake-book",
    aside: "Small session. Real progress.",
  },
  sessionPlan: {
    eyebrow: "TODAY, KEEP IT LIGHT",
    title: "Your 20-minute reset",
    steps: [
      { index: "01", label: "Understand 5 saved mistakes" },
      { index: "02", label: "Recall 8 equations" },
      { index: "03", label: "Retry one without the solution" },
    ],
  },
  latestMock: {
    title: "A score is a starting point.",
    meta: "Mock 12  ·  Full syllabus  ·  Example results",
    score: 548,
    maxScore: 720,
    deltaLabel: "+18 from Mock 11",
    breakdown: "144 correct  ·  28 incorrect  ·  8 skipped",
    attempts: [
      { id: "mock-10", label: "Mock 10", score: 512 },
      { id: "mock-11", label: "Mock 11", score: 530 },
      { id: "mock-12", label: "Mock 12", score: 548 },
    ],
  },
  subjectInsights: [
    {
      subject: "Physics",
      scoreLabel: "124 / 180",
      tip: "Force & friction need another look.",
    },
    {
      subject: "Chemistry",
      scoreLabel: "140 / 180",
      tip: "Revisit equilibrium before your next mock.",
    },
    {
      subject: "Biology",
      scoreLabel: "284 / 360",
      tip: "Keep cell-cycle recall in your rotation.",
    },
  ],
  equationBook: {
    eyebrow: "YOUR POCKET REVISION",
    title: "Equation Book",
    body: "Recall it. Don’t just recognise it.",
    ctaLabel: "Review 8 due cards  →",
    ctaHref: "/equation-book",
  },
  nextMock: {
    eyebrow: "READY FOR A FRESH ATTEMPT?",
    title: "NEET full-syllabus mock",
    meta: "180 questions  ·  180 minutes",
    ctaLabel: "View mocks  →",
    ctaHref: "/mocks",
  },
  perspective: {
    eyebrow: "A LITTLE PERSPECTIVE",
    title: "See where you could go.",
    body: "Open Analysis for subject trends, attempts, and what to fix next.",
    ctaLabel: "Open Analysis  →",
    ctaHref: "/analysis",
  },
  footerRight: "Illustrative data · No admission prediction",
};
