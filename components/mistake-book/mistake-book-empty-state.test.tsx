import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookEmptyState } from "@/components/mistake-book/mistake-book-empty-state";
import { MISTAKE_BOOK_EMPTY_CONTENT } from "@/lib/mistake-book/empty-content";

describe("MistakeBookEmptyState", () => {
  it("renders the designed empty layout copy", () => {
    render(<MistakeBookEmptyState />);

    expect(screen.getByTestId("mistake-book-empty-state")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(screen.getByText(MISTAKE_BOOK_EMPTY_CONTENT.subtitle)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Nothing to review\.\s*Yet\./i })
    ).toBeInTheDocument();
    expect(screen.getByText(MISTAKE_BOOK_EMPTY_CONTENT.heroBody)).toBeInTheDocument();
    expect(screen.getByText("Why you missed it")).toBeInTheDocument();
    expect(screen.getByText("NCERT page")).toBeInTheDocument();
    expect(screen.getByText("Time to understand")).toBeInTheDocument();
    expect(screen.getByText(MISTAKE_BOOK_EMPTY_CONTENT.reviewTitle)).toBeInTheDocument();
    expect(screen.getByText(MISTAKE_BOOK_EMPTY_CONTENT.reviewBody)).toBeInTheDocument();
    expect(screen.getByText("Take a mock")).toBeInTheDocument();
    expect(screen.getByText("Misses collect here")).toBeInTheDocument();
    expect(screen.getByText("Mark it understood")).toBeInTheDocument();
  });

  it("shows disabled subject and chapter filters", () => {
    render(<MistakeBookEmptyState />);
    expect(screen.getByLabelText("Subject")).toBeDisabled();
    expect(screen.getByLabelText("Chapter")).toBeDisabled();
  });
});
