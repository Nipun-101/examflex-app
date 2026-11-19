import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudyShell } from "@/components/study/study-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

describe("StudyShell", () => {
  it("wraps children with the study navigation chrome", () => {
    const { container } = render(
      <StudyShell>
        <p>Study child</p>
      </StudyShell>
    );

    expect(screen.getByText("Study child")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Study" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profile/i })).toBeInTheDocument();

    const content = screen.getByText("Study child").parentElement;
    expect(content).toHaveClass("min-w-0");
    expect(container.firstChild).toBeTruthy();
  });
});
