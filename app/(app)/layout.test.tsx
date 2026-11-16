import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppLayout from "@/app/(app)/layout";

vi.mock("@/components/study/authenticated-study-area", () => ({
  AuthenticatedStudyArea: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="authenticated-study-area">{children}</div>
  ),
}));

describe("AppLayout", () => {
  it("wraps the authenticated study area in Suspense", () => {
    render(
      <AppLayout>
        <p>Protected child</p>
      </AppLayout>
    );

    expect(screen.getByTestId("authenticated-study-area")).toBeInTheDocument();
    expect(screen.getByText("Protected child")).toBeInTheDocument();
  });
});
