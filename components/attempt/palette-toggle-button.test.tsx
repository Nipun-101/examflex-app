import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaletteToggleButton } from "@/components/attempt/palette-toggle-button";

describe("PaletteToggleButton", () => {
  it("keeps its accessible name and opens on click", async () => {
    const onClick = vi.fn();
    render(<PaletteToggleButton onClick={onClick} notVisitedCount={4} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Open question palette" }),
    );
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows a plain badge dot with no number while questions are unvisited", () => {
    render(<PaletteToggleButton onClick={vi.fn()} notVisitedCount={179} />);
    const badge = screen.getByTestId("palette-not-visited-badge");
    expect(badge).toBeEmptyDOMElement();
    expect(
      screen.getByRole("button", { name: "Open question palette" }),
    ).not.toHaveTextContent("179");
  });

  it("hides the badge when every question has been visited", () => {
    render(<PaletteToggleButton onClick={vi.fn()} notVisitedCount={0} />);
    expect(
      screen.queryByTestId("palette-not-visited-badge"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Open question palette" }),
    ).not.toHaveAccessibleDescription();
  });
});
