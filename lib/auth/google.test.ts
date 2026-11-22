import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const exchangeGoogleCode = vi.fn();
const getWindow = vi.fn(() => window);

vi.mock("@/lib/api/auth", () => ({
  exchangeGoogleCode: (...args: unknown[]) => exchangeGoogleCode(...args),
}));

vi.mock("@/lib/auth/runtime-env", () => ({
  getWindow: () => getWindow(),
}));

function setLocationSearch(search: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...window.location,
      origin: "http://localhost:3002",
      search,
      pathname: "/",
      href: `http://localhost:3002/${search}`,
      assign: vi.fn(),
    },
  });
}

describe("google auth", () => {
  beforeEach(async () => {
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = "client-id";
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI = "http://localhost:3002";
    sessionStorage.clear();
    getWindow.mockReset();
    getWindow.mockImplementation(() => window);
    setLocationSearch("?redirect=%2Fprofile");
    const { resetGoogleSessionForTests } = await import("@/lib/auth/google");
    resetGoogleSessionForTests();
    exchangeGoogleCode.mockReset();
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    delete process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  });

  it("reports configuration and starts Google sign-in", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: "http://localhost:3002",
        search: "?redirect=%2Fprofile",
        pathname: "/login",
        href: "http://localhost:3002/login?redirect=%2Fprofile",
        assign,
        protocol: "http:",
      },
    });

    const {
      isGoogleSignInConfigured,
      googleClientId,
      googleRedirectUri,
      startGoogleSignIn,
    } = await import("@/lib/auth/google");

    expect(isGoogleSignInConfigured()).toBe(true);
    expect(googleClientId()).toBe("client-id");
    expect(googleRedirectUri()).toBe("http://localhost:3002");

    await startGoogleSignIn("/analysis");
    expect(assign).toHaveBeenCalled();
    expect(sessionStorage.getItem("examflex.google.oauth.state")).toBeTruthy();
    expect(sessionStorage.getItem("examflex.google.oauth.next")).toBe(
      "/analysis"
    );

    await startGoogleSignIn();
    expect(sessionStorage.getItem("examflex.google.oauth.next")).toBe(
      "/profile"
    );
  });

  it("throws when Google is not configured", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const { startGoogleSignIn } = await import("@/lib/auth/google");
    await expect(startGoogleSignIn()).rejects.toThrow(/not configured/);
  });

  it("throws when the browser window is unavailable", async () => {
    getWindow.mockReturnValue(undefined);
    const { startGoogleSignIn } = await import("@/lib/auth/google");
    await expect(startGoogleSignIn()).rejects.toThrow(/not configured/);
  });

  it("reads OAuth errors and state mismatches", async () => {
    const { readGoogleReturn, clearGoogleHandoff } = await import(
      "@/lib/auth/google"
    );
    setLocationSearch("?error=access_denied");
    expect(readGoogleReturn()).toEqual({
      ok: false,
      message: "Google sign-in was cancelled.",
    });

    setLocationSearch("?error=server_error");
    expect(readGoogleReturn().ok).toBe(false);

    setLocationSearch("");
    expect(readGoogleReturn()).toMatchObject({
      ok: false,
      message: "Google did not return a sign-in code.",
    });

    sessionStorage.setItem("examflex.google.oauth.state", "expected");
    setLocationSearch("?code=c&state=wrong");
    expect(readGoogleReturn().ok).toBe(false);

    sessionStorage.setItem("examflex.google.oauth.state", "expected");
    setLocationSearch("?code=c&state=expected");
    expect(readGoogleReturn()).toMatchObject({
      ok: false,
      message: "Google sign-in expired. Please try again.",
    });
    clearGoogleHandoff();
  });

  it("completes a Google session after a valid handoff", async () => {
    sessionStorage.setItem("examflex.google.oauth.state", "state");
    sessionStorage.setItem("examflex.google.oauth.verifier", "verifier");
    sessionStorage.setItem(
      "examflex.google.oauth.redirect",
      "http://localhost:3002"
    );
    sessionStorage.setItem("examflex.google.oauth.next", "/today");
    setLocationSearch("?code=auth-code&state=state");

    exchangeGoogleCode.mockResolvedValue({
      ok: true,
      data: {
        accessToken: "access",
        isNewUser: false,
        user: {
          id: "1",
          name: "Ada",
          email: "a@examflex.in",
          role: "student",
        },
      },
    });

    const { completeGoogleSession } = await import("@/lib/auth/google");
    const first = completeGoogleSession();
    const second = completeGoogleSession();
    await expect(first).resolves.toEqual({
      ok: true,
      accessToken: "access",
      nextPath: "/today",
    });
    await expect(second).resolves.toMatchObject({ ok: true });
  });

  it("surfaces API failures from Google exchange", async () => {
    sessionStorage.setItem("examflex.google.oauth.state", "state");
    sessionStorage.setItem("examflex.google.oauth.verifier", "verifier");
    sessionStorage.setItem(
      "examflex.google.oauth.redirect",
      "http://localhost:3002"
    );
    sessionStorage.setItem("examflex.google.oauth.next", "/today");
    setLocationSearch("?code=auth-code&state=state");
    exchangeGoogleCode.mockResolvedValue({
      ok: false,
      message: "Nope",
    });
    const { completeGoogleSession, resetGoogleSessionForTests } = await import(
      "@/lib/auth/google"
    );
    resetGoogleSessionForTests();
    await expect(completeGoogleSession()).resolves.toEqual({
      ok: false,
      message: "Nope",
    });
  });

  it("falls back to registered redirect when env override is unset", async () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
    setLocationSearch("");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: "http://localhost:3002",
        search: "",
        pathname: "/",
        href: "http://localhost:3002/",
        assign: vi.fn(),
        protocol: "http:",
      },
    });
    const { googleRedirectUri } = await import("@/lib/auth/google");
    expect(googleRedirectUri()).toBe("http://localhost:3002");
    expect(googleRedirectUri("https://unknown.example")).toBe("");
    expect(googleRedirectUri("")).toBe("");
  });

  it("completes with a parsed OAuth failure without calling the API", async () => {
    setLocationSearch("?error=access_denied");
    const { completeGoogleSession, resetGoogleSessionForTests } = await import(
      "@/lib/auth/google"
    );
    resetGoogleSessionForTests();
    await expect(completeGoogleSession()).resolves.toEqual({
      ok: false,
      message: "Google sign-in was cancelled.",
    });
    expect(exchangeGoogleCode).not.toHaveBeenCalled();
  });

  it("maps rejected Google exchanges to a friendly error", async () => {
    sessionStorage.setItem("examflex.google.oauth.state", "state");
    sessionStorage.setItem("examflex.google.oauth.verifier", "verifier");
    sessionStorage.setItem(
      "examflex.google.oauth.redirect",
      "http://localhost:3002"
    );
    sessionStorage.setItem("examflex.google.oauth.next", "/today");
    setLocationSearch("?code=auth-code&state=state");
    exchangeGoogleCode.mockRejectedValue(new Error("network"));
    const { completeGoogleSession, resetGoogleSessionForTests } = await import(
      "@/lib/auth/google"
    );
    resetGoogleSessionForTests();
    await expect(completeGoogleSession()).resolves.toEqual({
      ok: false,
      message: "Google sign-in could not be completed. Please try again.",
    });
  });
});
