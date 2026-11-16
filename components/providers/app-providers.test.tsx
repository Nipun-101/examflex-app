import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppProviders } from "@/components/providers/app-providers";

vi.mock("@/components/providers/auth-session-provider", () => ({
  AuthSessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

describe("AppProviders", () => {
  it("wraps children with AuthSessionProvider", () => {
    render(
      <AppProviders>
        <span>child</span>
      </AppProviders>
    );
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
    expect(screen.getByText("child")).toBeInTheDocument();
  });
});
