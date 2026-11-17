import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { MistakeQuestionBlock } from "@/components/mistake-book/mistake-question-block";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

describe("MistakeQuestionBlock", () => {
  it("renders question metadata and Mathpix stem", async () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(
      <MathpixBoundary>
        <MistakeQuestionBlock mistake={mistake} />
      </MathpixBoundary>
    );

    expect(screen.getByText(/Q34/i)).toBeInTheDocument();
    expect(screen.getByText(mistake.examTimeLabel!)).toBeInTheDocument();
    expect(await screen.findByTestId("mathpix-markdown")).toHaveTextContent(
      mistake.prompt
    );
  });

  it("shows the stem figure when imageUrl is present", () => {
    const mistake = {
      ...MISTAKE_BOOK_DATA.mistakes[0]!,
      prompt: "Fig. shows the position of a particle.",
      imageUrl: "https://cdn.test/fig.png",
    };
    render(
      <MathpixBoundary>
        <MistakeQuestionBlock mistake={mistake} />
      </MathpixBoundary>
    );

    expect(screen.getByRole("img", { name: "Question figure" })).toHaveAttribute(
      "src",
      "https://cdn.test/fig.png"
    );
  });

  it("shows only the figure when the stem has no text", () => {
    const mistake = {
      ...MISTAKE_BOOK_DATA.mistakes[0]!,
      prompt: "",
      imageUrl: "https://cdn.test/only.png",
    };
    render(<MistakeQuestionBlock mistake={mistake} />);

    expect(screen.getByRole("img", { name: "Question figure" })).toBeInTheDocument();
    expect(screen.queryByTestId("mathpix-markdown")).not.toBeInTheDocument();
  });
});
