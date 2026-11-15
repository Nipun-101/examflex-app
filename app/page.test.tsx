import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("composes the full landing page shell", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: /Rise above cutoffs/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Which exam are you cracking?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Study smarter, not just longer" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Tests that feel like the real thing",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Know exactly where you stand" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Your rank is built one test at a time.",
      })
    ).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
