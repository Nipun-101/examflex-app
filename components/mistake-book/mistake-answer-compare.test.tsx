import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { MistakeAnswerCompare } from "@/components/mistake-book/mistake-answer-compare";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";
import { MISTAKE_BOOK_COPY } from "@/types/mistake-book";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

describe("MistakeAnswerCompare", () => {
  it("renders your answer and correct answer through Mathpix", async () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(
      <MathpixBoundary>
        <MistakeAnswerCompare mistake={mistake} />
      </MathpixBoundary>
    );

    expect(screen.getByText(mistake.yourAnswerLabel!)).toBeInTheDocument();
    expect(screen.getByText(mistake.correctAnswerLabel)).toBeInTheDocument();

    const mathNodes = await screen.findAllByTestId("mathpix-markdown");
    expect(mathNodes.map((node) => node.textContent)).toEqual(
      expect.arrayContaining([mistake.yourAnswer, mistake.correctAnswer])
    );
  });

  it("shows a grey unattended hint when no option was chosen", async () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[4]!;
    render(
      <MathpixBoundary>
        <MistakeAnswerCompare mistake={mistake} />
      </MathpixBoundary>
    );

    expect(
      screen.getByText(MISTAKE_BOOK_COPY.unattendedHint)
    ).toBeInTheDocument();
    expect(
      await screen.findByTestId("mathpix-markdown")
    ).toHaveTextContent(mistake.correctAnswer);
  });
});
