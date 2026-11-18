import { describe, expect, it } from "vitest";
import {
  chapterWiseMockHref,
  resolveEquationExam,
} from "@/lib/equation-book/resolve-exam";

const neet = { id: "neet", name: "NEET" };
const jee = { id: "jee", name: "JEE Main" };

describe("resolveEquationExam", () => {
  it("uses the preferred exam when available", () => {
    expect(
      resolveEquationExam({
        preferredExamId: "jee",
        availableExams: [neet, jee],
      })
    ).toEqual({ kind: "resolved", exam: jee });
  });

  it("auto-resolves a single available exam", () => {
    expect(
      resolveEquationExam({
        availableExams: [neet],
      })
    ).toEqual({ kind: "resolved", exam: neet });
  });

  it("asks the student when multiple exams remain", () => {
    expect(
      resolveEquationExam({
        availableExams: [neet, jee],
      })
    ).toEqual({ kind: "choose", exams: [neet, jee] });
  });

  it("intersects with equation exam tags", () => {
    expect(
      resolveEquationExam({
        preferredExamId: "jee",
        availableExams: [neet, jee],
        allowedExamIds: ["neet"],
      })
    ).toEqual({ kind: "resolved", exam: neet });
  });

  it("returns none when the pool is empty", () => {
    expect(
      resolveEquationExam({
        availableExams: [neet],
        allowedExamIds: ["missing"],
      })
    ).toEqual({ kind: "none" });
  });
});

describe("chapterWiseMockHref", () => {
  it("builds the deep-link path", () => {
    expect(chapterWiseMockHref("e1", "s1", "t1")).toBe(
      "/mocks/exam/e1/chapter-wise?subjectId=s1&topicId=t1"
    );
  });
});
