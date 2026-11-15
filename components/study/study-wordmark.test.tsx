import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyWordmark } from "@/components/study/study-wordmark";

describe("StudyWordmark", () => {
  it("links to Today with ExamFlex branding and study tagline", () => {
    render(<StudyWordmark />);

    expect(screen.getByRole("link", { name: /examflex/i })).toHaveAttribute(
      "href",
      "/today"
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
