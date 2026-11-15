import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeProgress } from "@/components/mistake-book/mistake-progress";

describe("MistakeProgress", () => {
  it("shows review labels and progressbar semantics", () => {
    render(
      <MistakeProgress
        label="Mock 12"
        current={2}
        total={6}
        percent={33}
      />
    );

    expect(screen.getByText("Mock 12")).toBeInTheDocument();
    expect(screen.getByText("2 of 6 mistakes")).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /Review progress: 2 of 6/i })
    ).toHaveAttribute("aria-valuenow", "33");
  });
});
