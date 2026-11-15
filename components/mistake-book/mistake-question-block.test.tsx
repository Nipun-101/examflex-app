import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeQuestionBlock } from "@/components/mistake-book/mistake-question-block";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeQuestionBlock", () => {
  it("renders question metadata and stem", () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(<MistakeQuestionBlock mistake={mistake} />);

    expect(screen.getByText(/Q34/i)).toBeInTheDocument();
    expect(screen.getByText(mistake.examTimeLabel)).toBeInTheDocument();
    expect(screen.getByText(mistake.prompt)).toBeInTheDocument();
  });
});
