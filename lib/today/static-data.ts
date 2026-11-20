import type { TodayPageData } from "@/types/today";

/** Empty / new-user seed — also used as soft error fallback (never fake scores). */
export const TODAY_EMPTY_SEED: TodayPageData = {
  mode: "empty",
  examId: null,
  overview: {
    eyebrow: "WELCOME TO YOUR STUDY SPACE",
    headline: "One good step at a time.",
    subhead:
      "Not more things to study. A clearer idea of what to do next.",
    paceBadge: "examflex  /  Your pace, your plan",
  },
  nextStep: {
    eyebrow: "START HERE",
    title: "Your first step is one mock.",
    body: "Take a full-syllabus mock. Misses land in your Mistake Book for calm review, and you get a score you can build on.",
    ctaLabel: "Take your first mock  →",
    ctaHref: "/mocks",
    aside: "Small start. Real progress.",
    showPath: true,
  },
  sessionPlan: {
    eyebrow: "TODAY, KEEP IT LIGHT",
    title: "Your 20-minute reset",
    steps: [
      { index: "01", label: "Take your first mock", state: "active" },
      {
        index: "02",
        label: "Understand your saved mistakes",
        state: "active",
      },
      {
        index: "03",
        label: "Recall your first equations",
        state: "active",
      },
    ],
  },
  latestMock: {
    title: "A score is a starting point.",
    meta: "Your first mock · Full syllabus",
    score: null,
    maxScore: 720,
    deltaLabel: null,
    breakdown: null,
    placeholderMessage: "Your first score lands here",
    attempts: [
      { id: "placeholder-1", label: "Mock 1", score: null },
      { id: "placeholder-2", label: "Mock 2", score: null },
      { id: "placeholder-3", label: "Mock 3", score: null },
    ],
  },
  subjectInsights: {
    title: "Where your next session can help",
    subhead:
      "After your first mock, we point to the chapter worth another look.",
    items: [
      {
        subject: "Physics",
        scoreLabel: "— / 180",
        tip: "",
        averagePercent: null,
      },
      {
        subject: "Chemistry",
        scoreLabel: "— / 180",
        tip: "",
        averagePercent: null,
      },
      {
        subject: "Biology",
        scoreLabel: "— / 360",
        tip: "",
        averagePercent: null,
      },
    ],
  },
  equationBook: {
    eyebrow: "YOUR POCKET REVISION",
    title: "Equation Book",
    body: "Recall it. Don't just recognise it.",
    ctaLabel: "Open Equation Book  →",
    ctaHref: "/equation-book",
    statusPill: "Flip a card. Say it out loud. Then check.",
  },
  mistakeBook: {
    eyebrow: "TURN MISSES INTO MOMENTUM",
    title: "Mistake Book",
    body: "Wrong answers become short reviews — not a pile you ignore.",
    ctaLabel: "Open Mistake Book  →",
    ctaHref: "/mistake-book",
    statusPill: "Fills in after your first mock",
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
    body: "Pathways appear after your first score. Past cutoffs, not promises.",
    ctaLabel: "Unlocks with your first score",
    ctaHref: "/analysis",
    locked: true,
  },
  footerRight: "No admission prediction",
};

/**
 * Active-state fixture for component tests (not used as the live happy path).
 */
export const TODAY_PAGE_DATA: TodayPageData = {
  mode: "active",
  examId: "fixture-exam",
  overview: {
    eyebrow: "YOUR STUDY SPACE",
    headline: "One good step at a time.",
    subhead:
      "Not more things to study. A clearer idea of what to do next.",
    paceBadge: "examflex  /  Your pace, your plan",
  },
  nextStep: {
    eyebrow: "PICK UP WHERE YOU LEFT OFF",
    title: "Your mistakes have a next chapter.",
    body: "19 questions left to review from Mock 12. Start with 5 today.",
    ctaLabel: "Open Mistake Book  →",
    ctaHref: "/mistake-book",
    aside: "Small session. Real progress.",
    showPath: false,
  },
  sessionPlan: {
    eyebrow: "TODAY, KEEP IT LIGHT",
    title: "Your 20-minute reset",
    steps: [
      { index: "01", label: "Understand 5 saved mistakes", state: "active" },
      { index: "02", label: "Recall 8 equations", state: "active" },
      {
        index: "03",
        label: "Retry one without the solution",
        state: "active",
      },
    ],
  },
  latestMock: {
    title: "A score is a starting point.",
    meta: "Mock 12  ·  Full syllabus  ·  Example results",
    score: 548,
    maxScore: 720,
    deltaLabel: "+18 from Mock 11",
    breakdown: "144 correct  ·  28 incorrect  ·  8 skipped",
    placeholderMessage: null,
    attempts: [
      { id: "mock-10", label: "Mock 10", score: 512 },
      { id: "mock-11", label: "Mock 11", score: 530 },
      { id: "mock-12", label: "Mock 12", score: 548 },
    ],
  },
  subjectInsights: {
    title: "Where your next session can help",
    subhead: null,
    items: [
      {
        subject: "Physics",
        scoreLabel: "62%",
        tip: "Force & friction need another look.",
        averagePercent: 62,
      },
      {
        subject: "Chemistry",
        scoreLabel: "78%",
        tip: "Revisit equilibrium before your next mock.",
        averagePercent: 78,
      },
      {
        subject: "Biology",
        scoreLabel: "79%",
        tip: "Keep cell-cycle recall in your rotation.",
        averagePercent: 79,
      },
    ],
  },
  equationBook: {
    eyebrow: "YOUR POCKET REVISION",
    title: "Equation Book",
    body: "Recall it. Don’t just recognise it.",
    ctaLabel: "Open Equation Book  →",
    ctaHref: "/equation-book",
    statusPill: "Flip a card. Say it out loud. Then check.",
  },
  mistakeBook: {
    eyebrow: "TURN MISSES INTO MOMENTUM",
    title: "Mistake Book",
    body: "19 saved questions waiting for a calm look.",
    ctaLabel: "Open Mistake Book  →",
    ctaHref: "/mistake-book",
    statusPill: "Start with 5 today",
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
    body: "Open Analysis for full-mock form, course pathways, and chapter insights.",
    ctaLabel: "Open Analysis  →",
    ctaHref: "/analysis",
    locked: false,
  },
  footerRight: "Illustrative data · No admission prediction",
};
