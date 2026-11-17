import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResultsQuestionMap } from "@/components/attempt/results-question-map";

describe("ResultsQuestionMap", () => {
  it("renders outcomes and jumps on tap", async () => {
    const onJump = vi.fn();
    render(
      <ResultsQuestionMap
        items={[
          { paperNumber: 1, questionId: "q1", outcome: "wrong" },
          { paperNumber: 2, questionId: "q2", outcome: "correct" },
          { paperNumber: 3, questionId: "q3", outcome: "skipped" },
        ]}
        onJump={onJump}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Question map" })
    ).toBeInTheDocument();
    expect(screen.getByText("Tap to jump")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Question 2, correct" })
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Question 1, wrong" })
    );
    expect(onJump).toHaveBeenCalledWith(1);
  });
});
