import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

describe("AppShell", () => {
  it("wraps children with header and bottom navigation", () => {
    render(
      <AppShell>
        <p>Shell child</p>
      </AppShell>
    );

    expect(screen.getByText("Shell child")).toBeInTheDocument();
    expect(screen.getByText("ExamFlex")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
  });
});
