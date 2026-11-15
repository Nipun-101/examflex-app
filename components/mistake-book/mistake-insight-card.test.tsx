import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeInsightCard } from "@/components/mistake-book/mistake-insight-card";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeInsightCard", () => {
  it("renders the insight title, body, and formula", () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(<MistakeInsightCard mistake={mistake} />);

    expect(
      screen.getByRole("heading", { name: mistake.insightTitle })
    ).toBeInTheDocument();
    expect(screen.getByText(mistake.insightBody)).toBeInTheDocument();
    expect(screen.getByText(mistake.insightFormula)).toBeInTheDocument();
  });
});
