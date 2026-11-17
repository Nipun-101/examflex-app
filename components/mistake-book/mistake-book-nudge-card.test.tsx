import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookNudgeCard } from "@/components/mistake-book/mistake-book-nudge-card";

describe("MistakeBookNudgeCard", () => {
  it("renders the static nudge copy", () => {
    render(<MistakeBookNudgeCard />);
    expect(screen.getByText(/Today's nudge/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Five a day beats fifty on Sunday/i)
    ).toBeInTheDocument();
  });
});
