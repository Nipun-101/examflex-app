import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodaySubjectFocusIllustration } from "@/components/study/today-subject-focus-illustration";

describe("TodaySubjectFocusIllustration", () => {
  it("renders a decorative svg", () => {
    const { container } = render(<TodaySubjectFocusIllustration />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute("aria-hidden");
  });
});
