import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthenticatedAppArea } from "@/components/study/authenticated-app-area";

vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(async () => ({
    user: { id: "session", displayName: "Student", exam: "NEET" },
  })),
}));

describe("AuthenticatedAppArea", () => {
  it("requires a session then renders children without study nav", async () => {
    const ui = await AuthenticatedAppArea({
      children: <p>Protected child</p>,
    });

    render(ui);

    expect(screen.getByText("Protected child")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Study" })
    ).not.toBeInTheDocument();
  });
});
