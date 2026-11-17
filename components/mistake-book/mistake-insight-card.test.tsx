import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { MistakeInsightCard } from "@/components/mistake-book/mistake-insight-card";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

describe("MistakeInsightCard", () => {
  it("renders the insight title, body, and formula through Mathpix", async () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(
      <MathpixBoundary>
        <MistakeInsightCard mistake={mistake} />
      </MathpixBoundary>
    );

    expect(
      screen.getByRole("heading", { name: mistake.insightTitle })
    ).toBeInTheDocument();

    const mathNodes = await screen.findAllByTestId("mathpix-markdown");
    expect(mathNodes.map((node) => node.textContent)).toEqual(
      expect.arrayContaining([mistake.insightBody, mistake.insightFormula])
    );
  });
});
