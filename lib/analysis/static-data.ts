import type { AnalysisPageData } from "@/types/analysis";

/** Static Analysis content — replace with API payloads later. */
export const ANALYSIS_PAGE_DATA: AnalysisPageData = {
  title: "Your possibilities",
  tagline: "Explore a path, not a promise.",
  examBadge: "NEET  /  examflex",
  outlookLabel: "ILLUSTRATIVE MARKS-ONLY OUTLOOK",
  performance: {
    label: "LATEST PERFORMANCE · MOCK 12",
    score: 548,
    maxScore: 720,
    scoreHint: "Example score · based on marks only",
    editLabel: "Edit",
  },
  sectionTitle: "What this level could open up",
  sectionSubtitle: "Example guidance · not a validated prediction",
  pathways: [
    {
      id: "mbbs",
      title: "MBBS",
      subtitle: "Medicine · sample outlook",
      badge: "Higher marks may be needed",
      tone: "stretch",
    },
    {
      id: "bds",
      title: "BDS",
      subtitle: "Dentistry · sample outlook",
      badge: "A potential path to explore",
      tone: "explore",
    },
    {
      id: "veterinary",
      title: "Veterinary · BVSc & AH",
      subtitle: "Animal healthcare · sample outlook",
      badge: "A potential path to explore",
      tone: "explore",
    },
  ],
  disclaimer: {
    title: "HOW TO READ THIS",
    body: "All calculations are based entirely on marks only. Authorities may calculate outcomes differently. Rank, category, domicile, quota, eligibility and seat availability are not included. This is an indicator, not an admission guarantee.",
  },
  cutoffLabel: "Check official counselling cutoffs  ↗",
  cutoffHref: "https://www.nta.ac.in/",
};
