export type MistakeBookEmptyStep = {
  number: string;
  title: string;
  body: string;
};

export type MistakeBookEmptyContent = {
  subtitle: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  tags: readonly string[];
  reviewEyebrow: string;
  reviewTitle: string;
  reviewBody: string;
  fillEyebrow: string;
  steps: readonly MistakeBookEmptyStep[];
};

/** Copy for the Mistake Book empty state (matches design). */
export const MISTAKE_BOOK_EMPTY_CONTENT: MistakeBookEmptyContent = {
  subtitle: "No mocks reviewed yet",
  heroEyebrow: "A clean page",
  heroTitle: "Nothing to review. Yet.",
  heroBody:
    "After a mock, every question you miss lands here, with the reason you missed it, the NCERT page behind it, and a timer for how long it took to click.",
  tags: ["Why you missed it", "NCERT page", "Time to understand"],
  reviewEyebrow: "Review session",
  reviewTitle: "All clear for now",
  reviewBody: "Card 0 of 0. Nothing waiting for you.",
  fillEyebrow: "How your book fills up",
  steps: [
    {
      number: "01",
      title: "Take a mock",
      body: "Any full mock, chapter test, or Rapid Round.",
    },
    {
      number: "02",
      title: "Misses collect here",
      body: "Each with its reason and NCERT page.",
    },
    {
      number: "03",
      title: "Mark it understood",
      body: "It leaves the book. The book gets lighter.",
    },
  ],
};
