import type { ApiSubjectForExam } from "@/types/exam";
import type { EquationExamOption, EquationItem } from "@/types/equation-book";

export const TEST_EXAMS: EquationExamOption[] = [
  { id: "exam-neet", name: "NEET" },
  { id: "exam-jee", name: "JEE Main" },
];

export const TEST_SUBJECTS: ApiSubjectForExam[] = [
  {
    id: "sub-physics",
    name: "Physics",
    topics: [
      { id: "top-lom", name: "Laws of motion" },
      { id: "top-wep", name: "Work, energy & power" },
    ],
  },
  {
    id: "sub-chem",
    name: "Chemistry",
    topics: [{ id: "top-eq", name: "Chemical equilibrium" }],
  },
];

export const TEST_EQUATIONS: EquationItem[] = [
  {
    id: "eq-1",
    title: "Net force on a free body?",
    shortDescription: "Start from ΣF before writing a.",
    equation: "$$\\Sigma F = ma$$",
    longDescription:
      "Resolve axes carefully when friction or incline appears.",
    mnemonic: "Sigma first.",
    bulletPoints: ["Always resolve axes"],
    subject: { id: "sub-physics", name: "Physics" },
    topic: { id: "top-lom", name: "Laws of motion" },
    exams: [TEST_EXAMS[0]!],
    isActive: true,
  },
  {
    id: "eq-2",
    title: "Static friction limit?",
    shortDescription: "Think of the maximum before slipping.",
    equation: "$$f_s \\le \\mu_s N$$",
    bulletPoints: [],
    subject: { id: "sub-physics", name: "Physics" },
    topic: { id: "top-lom", name: "Laws of motion" },
    exams: TEST_EXAMS,
    isActive: true,
  },
];
