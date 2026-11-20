import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AnalysisCounselingCard } from "./analysis-counseling-card";

describe("AnalysisCounselingCard", () => {
  it("shows the request CTA and opens booking when clicked", async () => {
    const user = userEvent.setup();
    const onBook = vi.fn();
    render(
      <AnalysisCounselingCard
        examName="NEET UG"
        canRequest
        onBook={onBook}
      />
    );

    expect(screen.getByText(/PREMIUM · 1:1 WITH OUR NEET UG EXPERT/i)).toBeInTheDocument();
    expect(screen.getAllByText("The Examflex").length).toBeGreaterThan(0);
    const buttons = screen.getAllByRole("button", {
      name: /Book my 1:1 session/i,
    });
    await user.click(buttons[0]!);
    expect(onBook).toHaveBeenCalled();
  });

  it("shows thank-you copy without a book button when already booked", () => {
    render(
      <AnalysisCounselingCard
        examName="JEE Main"
        canRequest={false}
        onBook={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: /Thanks for booking/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Book my 1:1 session/i })
    ).not.toBeInTheDocument();
  });
});
