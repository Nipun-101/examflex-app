import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppLayout from "@/app/(app)/layout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

describe("AppLayout", () => {
  it("gates the study shell behind requireSession and renders children", async () => {
    const ui = await AppLayout({
      children: <p>Protected child</p>,
    });

    render(ui);

    expect(screen.getByText("Protected child")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Study" })).toBeInTheDocument();
  });
});
