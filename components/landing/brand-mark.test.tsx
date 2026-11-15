import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "@/components/landing/brand-mark";

describe("BrandMark", () => {
  it("renders the ExamFlex wordmark with accented Flex", () => {
    render(<BrandMark />);

    expect(screen.getByText("Exam")).toBeInTheDocument();
    expect(screen.getByText("Flex")).toHaveClass("text-primary");
    expect(screen.getByText("E")).toBeInTheDocument();
  });

  it("supports the light variant for dark surfaces", () => {
    const { container } = render(<BrandMark light className="extra" />);

    expect(container.firstChild).toHaveClass("extra");
    expect(screen.getByText("Flex")).toHaveClass("text-white/85");
  });
});
