import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedAppArea } from "@/components/study/authenticated-app-area";

const hasProfileCompleteHint = vi.fn();
const requireSession = vi.fn(async () => ({
  user: { id: "session", displayName: "Student", exam: "NEET" },
}));

vi.mock("@/lib/auth/session", () => ({
  requireSession: () => requireSession(),
  hasProfileCompleteHint: () => hasProfileCompleteHint(),
}));

let receivedHint: boolean | undefined;
vi.mock("@/components/onboarding/profile-gate", () => ({
  ProfileGate: ({
    children,
    initiallyComplete,
  }: {
    children: React.ReactNode;
    initiallyComplete?: boolean;
  }) => {
    receivedHint = initiallyComplete;
    return <div data-testid="profile-gate">{children}</div>;
  },
}));

describe("AuthenticatedAppArea", () => {
  beforeEach(() => {
    requireSession.mockClear();
    hasProfileCompleteHint.mockReset();
    hasProfileCompleteHint.mockResolvedValue(false);
    receivedHint = undefined;
  });

  it("requires a session then renders children without study nav", async () => {
    const ui = await AuthenticatedAppArea({
      children: <p>Protected child</p>,
    });

    render(ui);

    expect(requireSession).toHaveBeenCalled();
    expect(screen.getByText("Protected child")).toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Study" })
    ).not.toBeInTheDocument();
  });

  it("wraps the app in the profile gate", async () => {
    render(await AuthenticatedAppArea({ children: <p>Protected child</p> }));
    expect(screen.getByTestId("profile-gate")).toContainElement(
      screen.getByText("Protected child")
    );
  });

  it.each([
    [true, true],
    [false, false],
  ])("passes the server-side hint (%s) to the gate", async (hint, expected) => {
    hasProfileCompleteHint.mockResolvedValue(hint);
    render(await AuthenticatedAppArea({ children: <p>x</p> }));
    expect(receivedHint).toBe(expected);
  });

  it("does not render anything for a visitor without a session", async () => {
    requireSession.mockRejectedValueOnce(new Error("redirect"));
    await expect(AuthenticatedAppArea({ children: <p>x</p> })).rejects.toThrow("redirect");
    expect(hasProfileCompleteHint).not.toHaveBeenCalled();
  });
});
