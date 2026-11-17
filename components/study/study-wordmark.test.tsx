import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyWordmark } from "@/components/study/study-wordmark";

describe("StudyWordmark", () => {
  it("links to Today with the SVG wordmark and study tagline", () => {
    render(<StudyWordmark />);

    const link = screen.getByRole("link", { name: /examflex/i });
    expect(link).toHaveAttribute("href", "/today");
    expect(screen.getByRole("img", { name: "ExamFlex" })).toHaveAttribute(
      "src",
      "/examflex-wordmark.svg"
    );
    expect(
      screen.getByText("A little better, every attempt.")
    ).toBeInTheDocument();
  });

  it("accepts a custom href", () => {
    render(<StudyWordmark href="/profile" />);

    expect(screen.getByRole("link", { name: /examflex/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });
});
