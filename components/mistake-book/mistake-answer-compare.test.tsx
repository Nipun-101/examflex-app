import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeAnswerCompare } from "@/components/mistake-book/mistake-answer-compare";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeAnswerCompare", () => {
  it("shows your answer and the correct answer", () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(<MistakeAnswerCompare mistake={mistake} />);

    expect(screen.getByText(mistake.yourAnswerLabel)).toBeInTheDocument();
    expect(screen.getByText(mistake.yourAnswer)).toBeInTheDocument();
    expect(screen.getByText(mistake.correctAnswerLabel)).toBeInTheDocument();
    expect(screen.getByText(mistake.correctAnswer)).toBeInTheDocument();
  });
});
