export type EquationSubjectId = "physics" | "chemistry" | "biology";

export type EquationSubject = {
  id: EquationSubjectId;
  label: string;
};

export type EquationChapter = {
  id: string;
  label: string;
  subjectId: EquationSubjectId;
};

export type EquationCard = {
  id: string;
  chapterId: string;
  sourceLabel: string;
  promptTitle: string;
  recallHint: string;
  answerLabel: string;
  equation: string;
  note: string;
};

export type EquationBookPageData = {
  title: string;
  tagline: string;
  examBadge: string;
  subjects: readonly EquationSubject[];
  chapters: readonly EquationChapter[];
  cards: readonly EquationCard[];
  browseLabel: string;
  browseHref: string;
  mockHref: string;
};
