import type { PaperType } from "@/types/mock-test";

export type PapersEmptyStepStatus = "done" | "current" | "upcoming";

export type PapersEmptyStep = {
  label: string;
  statusLabel: string;
  status: PapersEmptyStepStatus;
};

export type PapersEmptyTip = {
  subject: string;
  tip: string;
};

export type PapersEmptyContent = {
  eyebrow: string;
  title: string;
  body: string;
  steps: PapersEmptyStep[];
  tipsHeading: string;
  tips: PapersEmptyTip[];
};

const WAIT_TIPS: PapersEmptyTip[] = [
  {
    subject: "Physics",
    tip: "Write the unit beside every number. Half of silly errors disappear.",
  },
  {
    subject: "Chemistry",
    tip: "Say the reaction in words before you write the equation.",
  },
  {
    subject: "Biology",
    tip: "Redraw the NCERT diagram from memory, then compare.",
  },
  {
    subject: "Mathematics",
    tip: "Solve one worked example without looking at the steps.",
  },
];

const PIPELINE_TAIL: PapersEmptyStep[] = [
  {
    label: "Papers being written",
    statusLabel: "In progress",
    status: "current",
  },
  {
    label: "Checked against NCERT",
    statusLabel: "Up next",
    status: "upcoming",
  },
  {
    label: "Lands here",
    statusLabel: "Soon",
    status: "upcoming",
  },
];

function content(
  firstStepLabel: string,
  body: string
): PapersEmptyContent {
  return {
    eyebrow: "Your selection",
    title: "Nothing here yet, but it's on the way.",
    body,
    steps: [
      {
        label: firstStepLabel,
        statusLabel: "Done",
        status: "done",
      },
      ...PIPELINE_TAIL,
    ],
    tipsHeading: "While you wait: one tip per subject",
    tips: WAIT_TIPS,
  };
}

/** Copy + timeline for the reusable papers empty state. */
export function papersEmptyContent(paperType: PaperType): PapersEmptyContent {
  if (paperType === "FULL_EXAM") {
    return content(
      "Full mock picked",
      "Full mocks are written paper by paper for each exam. Yours hasn't landed yet."
    );
  }
  if (paperType === "SPRINT") {
    return content(
      "Sprint picked",
      "Sprint tests are added in short sets for each subject. Yours hasn't landed yet."
    );
  }
  return content(
    "Chapter picked",
    "Papers are added chapter by chapter, for every subject. Yours hasn't landed yet."
  );
}
