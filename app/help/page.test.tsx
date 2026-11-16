import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HelpCentrePage from "@/app/help/page";

describe("HelpCentrePage", () => {
  it("renders help topics and support email", () => {
    render(<HelpCentrePage />);

    expect(
      screen.getByRole("heading", { name: "Help centre" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Getting started" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Plans & billing" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "support@examflex.in" })).toBeInTheDocument();
  });
});
