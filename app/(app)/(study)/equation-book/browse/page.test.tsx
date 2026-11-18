import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/equation-book/equation-browse-view", () => ({
  EquationBrowseView: () => <h1>Browse all equations</h1>,
}));

import EquationBookBrowsePage from "@/app/(app)/(study)/equation-book/browse/page";

describe("EquationBookBrowsePage", () => {
  it("renders the browse view", () => {
    render(<EquationBookBrowsePage />);
    expect(
      screen.getByRole("heading", { name: "Browse all equations" })
    ).toBeInTheDocument();
  });
});
