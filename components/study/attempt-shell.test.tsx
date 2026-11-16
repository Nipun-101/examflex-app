import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttemptShell } from "@/components/study/attempt-shell";

describe("AttemptShell", () => {
  it("renders children without study navigation", () => {
    render(
      <AttemptShell>
        <p>Attempt child</p>
      </AttemptShell>
    );

    expect(screen.getByText("Attempt child")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Study" })
    ).not.toBeInTheDocument();
  });
});
