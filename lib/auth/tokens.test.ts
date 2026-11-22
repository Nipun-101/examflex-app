import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshSession = vi.fn();
const logoutSession = vi.fn();
const getWindow = vi.fn(() => window);

vi.mock("@/lib/api/auth", () => ({
  refreshSession: (...args: unknown[]) => refreshSession(...args),
  logoutSession: (...args: unknown[]) => logoutSession(...args),
}));

vi.mock("@/lib/auth/runtime-env", () => ({
  getWindow: () => getWindow(),
}));

describe("auth tokens", () => {
  beforeEach(async () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    refreshSession.mockReset();
    logoutSession.mockReset();
    getWindow.mockReset();
    getWindow.mockImplementation(() => window);
    document.cookie.split(";").forEach((part) => {
      const name = part.split("=")[0]?.trim();
      if (name) {
        document.cookie = `${name}=; path=/; max-age=0`;
      }
    });
    localStorage.clear();
    sessionStorage.clear();
    const { resetAuthTokenStateForTests } = await import("@/lib/auth/tokens");
    resetAuthTokenStateForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("selects the Secure cookie suffix for https", async () => {
    const { cookieSecureSuffixForTests } = await import("@/lib/auth/tokens");
    expect(cookieSecureSuffixForTests("https:")).toBe("; Secure");
    expect(cookieSecureSuffixForTests("http:")).toBe("");
  });

  it("stores access tokens in memory and sets the session marker", async () => {
    const { getAuthToken, setAuthTokens, isAuthenticated } = await import(
      "@/lib/auth/tokens"
    );
    setAuthTokens("access-1");
    expect(getAuthToken()).toBe("access-1");
    expect(isAuthenticated()).toBe(true);
    expect(document.cookie).toContain("authSession=1");
    expect(localStorage.length).toBe(0);
  });

  it("removes tokens and notifies listeners", async () => {
    const {
      setAuthTokens,
      removeAuthToken,
      subscribeAuthChange,
      getAuthToken,
    } = await import("@/lib/auth/tokens");
    const listener = vi.fn();
    const unsubscribe = subscribeAuthChange(listener);
    setAuthTokens("access-1");
    removeAuthToken();
    expect(getAuthToken()).toBeNull();
    expect(listener).toHaveBeenCalled();
    unsubscribe();
  });

  it("heals orphan markers and missing markers", async () => {
    const {
      setAuthTokens,
      removeAuthToken,
      healAuthSessionCookies,
    } = await import("@/lib/auth/tokens");
    setAuthTokens("access-1");
    document.cookie = "authSession=; path=/; max-age=0";
    healAuthSessionCookies();
    expect(document.cookie).toContain("authSession=1");

    removeAuthToken();
    document.cookie = "authSession=1; path=/";
    healAuthSessionCookies();
    expect(document.cookie.includes("authSession=1")).toBe(false);
  });

  it("refreshes access tokens via single-flight", async () => {
    refreshSession.mockResolvedValue({
      ok: true,
      data: {
        accessToken: "fresh",
        isNewUser: false,
        user: {
          id: "1",
          name: "S",
          email: "s@examflex.in",
          role: "student",
        },
      },
    });
    const { refreshAccessToken, getAuthToken } = await import(
      "@/lib/auth/tokens"
    );
    const first = refreshAccessToken();
    const [a, b] = await Promise.all([first, refreshAccessToken()]);
    expect(a).toBe("fresh");
    expect(b).toBe("fresh");
    expect(getAuthToken()).toBe("fresh");
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it("clears the marker on failed refresh without a memory token", async () => {
    refreshSession.mockResolvedValue({
      ok: false,
      status: 401,
      message: "gone",
    });
    document.cookie = "authSession=1; path=/";
    const { refreshAccessToken } = await import("@/lib/auth/tokens");
    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(document.cookie.includes("authSession=1")).toBe(false);
  });

  it("drops the memory token and marker when refresh is rejected with 401", async () => {
    const { setAuthTokens, refreshAccessToken, getAuthToken } = await import(
      "@/lib/auth/tokens"
    );
    setAuthTokens("stale");
    refreshSession.mockResolvedValue({
      ok: false,
      status: 401,
      message: "Session has ended",
    });
    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(getAuthToken()).toBeNull();
    expect(document.cookie.includes("authSession=1")).toBe(false);
  });

  it("serialises refresh across tabs with the Web Locks API when available", async () => {
    const order: string[] = [];
    const request = vi.fn(
      async (_name: string, callback: () => Promise<unknown>) => {
        order.push("lock-acquired");
        const result = await callback();
        order.push("lock-released");
        return result;
      }
    );
    getWindow.mockImplementation(
      () =>
        Object.assign(Object.create(window), {
          navigator: { locks: { request } },
        }) as unknown as Window
    );
    refreshSession.mockImplementation(async () => {
      order.push("refresh");
      return { ok: false, status: 503, message: "down" };
    });
    const { refreshAccessToken } = await import("@/lib/auth/tokens");
    await refreshAccessToken();

    expect(request).toHaveBeenCalledWith(
      "examflex-auth-refresh",
      expect.any(Function)
    );
    expect(order).toEqual(["lock-acquired", "refresh", "lock-released"]);
  });

  it("does not wipe a token set by a login that finished during the refresh", async () => {
    let resolveRefresh: (value: unknown) => void = () => undefined;
    refreshSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );
    const { setAuthTokens, refreshAccessToken, getAuthToken } = await import(
      "@/lib/auth/tokens"
    );
    const pending = refreshAccessToken(); // boot refresh, no session yet
    setAuthTokens("fresh-from-login"); // Google exchange completes first
    resolveRefresh({ ok: false, status: 401, message: "no cookie" });

    await expect(pending).resolves.toBe("fresh-from-login");
    expect(getAuthToken()).toBe("fresh-from-login");
    expect(document.cookie).toContain("authSession=1");
  });

  it("clears only the marker on a 503 outage with no memory token", async () => {
    refreshSession.mockResolvedValue({
      ok: false,
      status: 503,
      message: "Sign-in is temporarily unavailable.",
    });
    document.cookie = "authSession=1; path=/";
    const { refreshAccessToken } = await import("@/lib/auth/tokens");
    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(document.cookie.includes("authSession=1")).toBe(false);
  });

  it("clears the marker when the network is down at boot", async () => {
    refreshSession.mockResolvedValue({ ok: false, message: "offline" });
    document.cookie = "authSession=1; path=/";
    const { refreshAccessToken } = await import("@/lib/auth/tokens");
    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(document.cookie.includes("authSession=1")).toBe(false);
  });

  it("renews the marker for the full sliding window", async () => {
    const { setAuthTokens } = await import("@/lib/auth/tokens");
    const setter = vi.spyOn(document, "cookie", "set");
    setAuthTokens("access");
    const written = setter.mock.calls.map(([value]) => String(value)).join("|");
    expect(written).toContain(`authSession=1; path=/; max-age=${30 * 86400}`);
    setter.mockRestore();
  });

  it("keeps the memory token when refresh throws", async () => {
    const { setAuthTokens, refreshAccessToken, getAuthToken } = await import(
      "@/lib/auth/tokens"
    );
    setAuthTokens("kept");
    refreshSession.mockRejectedValue(new Error("boom"));
    await expect(refreshAccessToken()).resolves.toBe("kept");
    expect(getAuthToken()).toBe("kept");
  });

  it("ignores non-401 refresh failures and listener errors", async () => {
    const {
      setAuthTokens,
      refreshAccessToken,
      subscribeAuthChange,
      getAuthToken,
    } = await import("@/lib/auth/tokens");
    subscribeAuthChange(() => {
      throw new Error("listener boom");
    });
    setAuthTokens("kept");
    refreshSession.mockResolvedValue({
      ok: false,
      status: 500,
      message: "server",
    });
    await expect(refreshAccessToken()).resolves.toBe("kept");
    expect(getAuthToken()).toBe("kept");
  });

  it("skips logout resume cookie for unsafe paths", async () => {
    logoutSession.mockResolvedValue({ ok: true });
    const { logout } = await import("@/lib/auth/tokens");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/",
        search: "",
        protocol: "http:",
        href: "http://localhost:3002/",
      },
    });
    Object.defineProperty(window.location, "href", {
      configurable: true,
      set: vi.fn(),
      get: () => "http://localhost:3002/",
    });
    await logout();
    expect(logoutSession).toHaveBeenCalled();
  });

  it("logs out and navigates home", async () => {
    logoutSession.mockResolvedValue({ ok: true });
    const { setAuthTokens, logout } = await import("@/lib/auth/tokens");
    setAuthTokens("access-1");
    sessionStorage.setItem("examflex.attempt.1", "1");
    const hrefSetter = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/today",
        search: "",
        protocol: "http:",
        href: "http://localhost:3002/today",
        assign: vi.fn(),
        replace: vi.fn(),
      },
    });
    Object.defineProperty(window.location, "href", {
      configurable: true,
      set: hrefSetter,
      get: () => "http://localhost:3002/today",
    });
    await logout();
    expect(logoutSession).toHaveBeenCalled();
    expect(sessionStorage.getItem("examflex.attempt.1")).toBeNull();
  });

  it("no-ops browser-only helpers when window is unavailable", async () => {
    getWindow.mockReturnValue(undefined);
    const {
      getAuthToken,
      setAuthTokens,
      removeAuthToken,
      healAuthSessionCookies,
      refreshAccessToken,
      logout,
      cookieSecureSuffixForTests,
    } = await import("@/lib/auth/tokens");

    expect(getAuthToken()).toBeNull();
    setAuthTokens("x");
    removeAuthToken();
    healAuthSessionCookies();
    await expect(refreshAccessToken()).resolves.toBeNull();
    await logout();
    expect(logoutSession).not.toHaveBeenCalled();
    expect(cookieSecureSuffixForTests("http:")).toBe("");
    const { exerciseCookieGuardsForTests } = await import("@/lib/auth/tokens");
    exerciseCookieGuardsForTests();
  });

  it("uses Secure cookie flags on https", async () => {
    getWindow.mockImplementation(
      () =>
        ({
          location: {
            protocol: "https:",
            pathname: "/today",
            search: "",
          },
          document,
          localStorage,
          sessionStorage,
        }) as unknown as Window
    );
    const { setAuthTokens, resetAuthTokenStateForTests } = await import(
      "@/lib/auth/tokens"
    );
    resetAuthTokenStateForTests();
    setAuthTokens("secure-token");
    expect(document.cookie).toContain("authSession=1");
  });

  it("keeps the marker while a refresh is in flight", async () => {
    let resolveRefresh: (value: unknown) => void = () => undefined;
    refreshSession.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );
    document.cookie = "authSession=1; path=/";
    const { refreshAccessToken, healAuthSessionCookies } = await import(
      "@/lib/auth/tokens"
    );
    const pending = refreshAccessToken();
    healAuthSessionCookies();
    expect(document.cookie).toContain("authSession=1");
    resolveRefresh({
      ok: false,
      status: 401,
      message: "gone",
    });
    await pending;
  });

  it("clears session caches even when sessionStorage iteration throws", async () => {
    logoutSession.mockResolvedValue({ ok: true });
    const { setAuthTokens, logout } = await import("@/lib/auth/tokens");
    setAuthTokens("access");
    vi.spyOn(sessionStorage, "key").mockImplementation(() => {
      throw new Error("boom");
    });
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/today",
        search: "",
        protocol: "http:",
        href: "http://localhost:3002/today",
      },
    });
    Object.defineProperty(window.location, "href", {
      configurable: true,
      set: vi.fn(),
      get: () => "http://localhost:3002/today",
    });
    await logout();
    expect(logoutSession).toHaveBeenCalled();
  });
});
