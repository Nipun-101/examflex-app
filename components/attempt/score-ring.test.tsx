import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScoreRing } from "@/components/attempt/score-ring";

describe("ScoreRing", () => {
  it("labels the score", () => {
    render(<ScoreRing earned={72} max={180} />);
    expect(screen.getByRole("img", { name: "Score 72 out of 180" })).toBeInTheDocument();
    expect(screen.getByText("of 180")).toBeInTheDocument();
  });

  it("draws a partial arc", () => {
    render(<ScoreRing earned={50} max={100} />);
    const arc = screen.getByTestId("score-ring-arc");
    expect(arc).toHaveAttribute("stroke-linecap", "round");
    expect(Number(arc.getAttribute("stroke-dashoffset"))).toBeGreaterThan(0);
  });

  it("closes the ring at full marks", () => {
    render(<ScoreRing earned={100} max={100} />);
    const arc = screen.getByTestId("score-ring-arc");
    expect(arc).toHaveAttribute("stroke-dashoffset", "0");
    expect(arc).toHaveAttribute("stroke-linecap", "butt");
  });

  it("omits the arc at zero", () => {
    render(<ScoreRing earned={0} max={100} />);
    expect(screen.queryByTestId("score-ring-arc")).not.toBeInTheDocument();
  });

  it("omits the arc without a maximum", () => {
    render(<ScoreRing earned={5} max={0} />);
    expect(screen.queryByTestId("score-ring-arc")).not.toBeInTheDocument();
  });

  it("supports the on-dark tone for the results summary", () => {
    render(<ScoreRing earned={2} max={10} tone="onDark" />);
    expect(screen.getByTestId("score-ring-arc")).toHaveAttribute(
      "stroke",
      "#daec9b"
    );
  });
});
