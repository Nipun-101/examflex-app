import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BottomNav } from "@/components/layout/bottom-nav";

describe("BottomNav", () => {
  it("renders primary mobile navigation items", () => {
    render(<BottomNav />);

    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Practice" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Mocks" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Analysis" })).toBeDisabled();
  });
});
