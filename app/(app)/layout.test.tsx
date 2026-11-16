import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppLayout from "@/app/(app)/layout";

vi.mock("@/components/study/authenticated-app-area", () => ({
  AuthenticatedAppArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-app-area">{children}</div>
  ),
}));

describe("AppLayout", () => {
  it("wraps the authenticated app area in Suspense", () => {
    render(
      <AppLayout>
        <p>Protected child</p>
      </AppLayout>
    );

    expect(screen.getByTestId("authenticated-app-area")).toBeInTheDocument();
    expect(screen.getByText("Protected child")).toBeInTheDocument();
  });
});
