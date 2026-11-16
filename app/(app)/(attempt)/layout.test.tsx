import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttemptLayout from "./layout";

vi.mock("@/components/study/attempt-shell", () => ({
  AttemptShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="attempt-shell">{children}</div>
  ),
}));

describe("attempt layout", () => {
  it("wraps pages in the attempt shell, without study navigation", () => {
    render(
      <AttemptLayout>
        <p>runner</p>
      </AttemptLayout>
    );
    expect(screen.getByTestId("attempt-shell")).toContainElement(screen.getByText("runner"));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
