import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileGate } from "@/components/onboarding/profile-gate";
import type { ApiUserProfile } from "@/types/user";

const getMyProfile = vi.fn();
const logout = vi.fn();
const setProfileCompleteHint = vi.fn();
const clearProfileCompleteHint = vi.fn();
let authStatus: "loading" | "authenticated" | "unauthenticated" = "authenticated";

vi.mock("@/lib/api/users", () => ({ getMyProfile: () => getMyProfile() }));
vi.mock("@/lib/auth/tokens", () => ({
  logout: () => logout(),
  setProfileCompleteHint: () => setProfileCompleteHint(),
  clearProfileCompleteHint: () => clearProfileCompleteHint(),
}));
vi.mock("@/components/providers/auth-session-provider", () => ({
  useAuthSession: () => ({ status: authStatus }),
}));
vi.mock("@/components/onboarding/onboarding-screen", () => ({
  OnboardingScreen: ({
    profile,
    onProfileChange,
    onComplete,
  }: {
    profile: ApiUserProfile;
    onProfileChange: (p: ApiUserProfile) => void;
    onComplete: (p: ApiUserProfile) => void;
  }) => (
    <div data-testid="onboarding">
      <span data-testid="verified">{String(profile.phoneVerified)}</span>
      <button onClick={() => onProfileChange({ ...profile, phoneVerified: true })}>
        verify
      </button>
      <button onClick={() => onComplete({ ...profile, profileComplete: true })}>
        finish
      </button>
    </div>
  ),
}));

const base: ApiUserProfile = {
  id: "u1",
  name: "Rahul",
  email: "rahul@gmail.com",
  role: "user",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const renderGate = (initiallyComplete?: boolean) =>
  render(
    <ProfileGate {...(initiallyComplete !== undefined ? { initiallyComplete } : {})}>
      <p>Today page</p>
    </ProfileGate>
  );

describe("ProfileGate", () => {
  beforeEach(() => {
    getMyProfile.mockReset();
    logout.mockReset();
    setProfileCompleteHint.mockReset();
    clearProfileCompleteHint.mockReset();
    authStatus = "authenticated";
  });
  afterEach(cleanup);

  it("opens the app for a learner whose profile is complete", async () => {
    getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: true } });
    renderGate();
    expect(await screen.findByText("Today page")).toBeInTheDocument();
    expect(screen.queryByTestId("onboarding")).not.toBeInTheDocument();
  });

  it("never shows app content while the profile is loading", async () => {
    let release: (v: unknown) => void = () => undefined;
    getMyProfile.mockReturnValue(new Promise((resolve) => { release = resolve; }));
    renderGate();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("Today page")).not.toBeInTheDocument();
    release({ ok: true, data: { ...base, profileComplete: true } });
    expect(await screen.findByText("Today page")).toBeInTheDocument();
  });

  it("does not even ask for the profile until the session is ready", () => {
    authStatus = "loading";
    renderGate();
    expect(getMyProfile).not.toHaveBeenCalled();
    expect(screen.queryByText("Today page")).not.toBeInTheDocument();
  });

  it.each([
    ["flag is false", { profileComplete: false }],
    ["flag is missing (fails closed)", {}],
  ])("shows onboarding instead of the app when the %s", async (_label, flags) => {
    getMyProfile.mockResolvedValue({ ok: true, data: { ...base, ...flags } });
    renderGate();
    expect(await screen.findByTestId("onboarding")).toBeInTheDocument();
    expect(screen.queryByText("Today page")).not.toBeInTheDocument();
  });

  it("keeps onboarding up while it progresses, then opens the app on completion", async () => {
    const user = userEvent.setup();
    getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: false, phoneVerified: false } });
    renderGate();
    expect(await screen.findByTestId("verified")).toHaveTextContent("false");

    await user.click(screen.getByText("verify"));
    expect(screen.getByTestId("verified")).toHaveTextContent("true");
    expect(screen.queryByText("Today page")).not.toBeInTheDocument();

    await user.click(screen.getByText("finish"));
    expect(await screen.findByText("Today page")).toBeInTheDocument();
  });

  it("does not let a failed profile load through, and can retry or log out", async () => {
    const user = userEvent.setup();
    getMyProfile.mockResolvedValueOnce({ ok: false, message: "Could not load your profile." });
    renderGate();
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load your profile.");
    expect(screen.queryByText("Today page")).not.toBeInTheDocument();

    getMyProfile.mockResolvedValueOnce({ ok: true, data: { ...base, profileComplete: true } });
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Today page")).toBeInTheDocument();
    expect(getMyProfile).toHaveBeenCalledTimes(2);
  });

  it("offers Log out on the error screen", async () => {
    const user = userEvent.setup();
    getMyProfile.mockResolvedValue({ ok: false, message: "nope" });
    renderGate();
    await user.click(await screen.findByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalled();
  });

  describe("remembering the verdict (a hint for the server, not a permission)", () => {
    it("sets the hint when the API says the profile is complete", async () => {
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: true } });
      renderGate();
      await screen.findByText("Today page");
      expect(setProfileCompleteHint).toHaveBeenCalledTimes(1);
      expect(clearProfileCompleteHint).not.toHaveBeenCalled();
    });

    it("clears the hint when the API says it is not", async () => {
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: false } });
      renderGate();
      await screen.findByTestId("onboarding");
      expect(clearProfileCompleteHint).toHaveBeenCalledTimes(1);
      expect(setProfileCompleteHint).not.toHaveBeenCalled();
    });

    it("sets the hint once onboarding is finished", async () => {
      const user = userEvent.setup();
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: false } });
      renderGate();
      await user.click(await screen.findByText("finish"));
      await screen.findByText("Today page");
      expect(setProfileCompleteHint).toHaveBeenCalledTimes(1);
    });
  });

  describe("when the server already rendered the app (hint cookie present)", () => {
    it("shows the app immediately, without a loading screen", () => {
      let release: (v: unknown) => void = () => undefined;
      getMyProfile.mockReturnValue(new Promise((resolve) => { release = resolve; }));
      renderGate(true);
      expect(screen.getByText("Today page")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      release({ ok: true, data: { ...base, profileComplete: true } });
    });

    it("shows the app even before the session is ready, matching the server HTML", () => {
      authStatus = "loading";
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: true } });
      renderGate(true);
      expect(screen.getByText("Today page")).toBeInTheDocument();
      expect(getMyProfile).not.toHaveBeenCalled();
    });

    it("still confirms with the API and keeps the app when confirmed", async () => {
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: true } });
      renderGate(true);
      await waitFor(() => expect(getMyProfile).toHaveBeenCalledTimes(1));
      expect(screen.getByText("Today page")).toBeInTheDocument();
      expect(screen.queryByTestId("onboarding")).not.toBeInTheDocument();
    });

    it("moves the learner to onboarding when the API disagrees with the hint", async () => {
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: false } });
      renderGate(true);
      expect(await screen.findByTestId("onboarding")).toBeInTheDocument();
      expect(screen.queryByText("Today page")).not.toBeInTheDocument();
      expect(clearProfileCompleteHint).toHaveBeenCalled();
    });

    it("does not take the app away when the check itself fails", async () => {
      getMyProfile.mockResolvedValue({ ok: false, message: "offline" });
      renderGate(true);
      await waitFor(() => expect(getMyProfile).toHaveBeenCalled());
      expect(screen.getByText("Today page")).toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not remount the app when the verdict arrives", async () => {
      let mounts = 0;
      function Probe() {
        useEffect(() => {
          mounts += 1;
        }, []);
        return <p>Probe</p>;
      }
      getMyProfile.mockResolvedValue({ ok: true, data: { ...base, profileComplete: true } });
      render(
        <ProfileGate initiallyComplete>
          <Probe />
        </ProfileGate>
      );
      await waitFor(() => expect(setProfileCompleteHint).toHaveBeenCalled());
      expect(mounts).toBe(1);
    });
  });

  it("ignores a response that arrives after unmounting", async () => {
    let release: (v: unknown) => void = () => undefined;
    getMyProfile.mockReturnValue(new Promise((resolve) => { release = resolve; }));
    const { unmount } = renderGate();
    unmount();
    release({ ok: true, data: { ...base, profileComplete: true } });
    await waitFor(() => expect(getMyProfile).toHaveBeenCalled());
  });
});
