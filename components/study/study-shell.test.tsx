import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudyShell } from "@/components/study/study-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
}));

describe("StudyShell", () => {
  it("wraps children with the study navigation chrome", () => {
    render(
      <StudyShell>
        <p>Study child</p>
      </StudyShell>
    );

    expect(screen.getByText("Study child")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Study" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profile/i })).toBeInTheDocument();
  });
});
