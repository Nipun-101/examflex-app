import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getAuthToken = vi.fn();
const refreshAccessToken = vi.fn();
const removeAuthToken = vi.fn();
const getWindow = vi.fn(() => window);

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => getAuthToken(),
  refreshAccessToken: () => refreshAccessToken(),
  removeAuthToken: () => removeAuthToken(),
}));

vi.mock("@/lib/auth/runtime-env", () => ({
  getWindow: () => getWindow(),
}));

describe("apiFetch", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    getAuthToken.mockReturnValue("mem-token");
    refreshAccessToken.mockReset();
    refreshAccessToken.mockResolvedValue("new-token");
    removeAuthToken.mockReset();
    getWindow.mockReset();
    getWindow.mockImplementation(() => window);
    vi.stubGlobal("fetch", vi.fn());
    window.history.pushState({}, "", "/today");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("attaches the bearer token and returns successful responses", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("ok", { status: 200 }));
    const { apiFetch } = await import("@/lib/api/client");
    const response = await apiFetch("/api/v1/users/me", { method: "GET" });
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/users/me",
      expect.objectContaining({
        credentials: "include",
      })
    );
  });

  it("refreshes once on 401 and retries", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response("nope", { status: 401 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const { apiFetch } = await import("@/lib/api/client");
    const response = await apiFetch("/api/v1/users/me", {
      method: "POST",
      body: "{}",
    });
    expect(response.status).toBe(200);
    expect(refreshAccessToken).toHaveBeenCalled();
  });

  it("redirects to login when refresh fails", async () => {
    refreshAccessToken.mockResolvedValue(null);
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...window.location,
        assign,
        pathname: "/today",
        search: "",
      },
    });
    vi.mocked(fetch).mockResolvedValue(new Response("nope", { status: 401 }));
    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/v1/users/me");
    expect(removeAuthToken).toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith("/login?redirect=%2Ftoday");
  });

  it("skips auth and refresh when requested", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("ok", { status: 401 }));
    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/v1/auth/refresh", {
      skipAuth: true,
      skipRefresh: true,
      body: "{}",
    });
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("omits Authorization when no memory token is present", async () => {
    getAuthToken.mockReturnValue(null);
    vi.mocked(fetch).mockResolvedValue(new Response("ok", { status: 200 }));
    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/v1/users/me");
    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBeNull();
  });

  it("retries a JSON body after refresh without duplicating Content-Type issues", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response("nope", { status: 401 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/v1/users/me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
    });
    expect(vi.mocked(fetch).mock.calls).toHaveLength(2);
  });

  it("skips login redirect when window is unavailable", async () => {
    getWindow.mockReturnValue(undefined);
    refreshAccessToken.mockResolvedValue(null);
    vi.mocked(fetch).mockResolvedValue(new Response("nope", { status: 401 }));
    const { apiFetch } = await import("@/lib/api/client");
    await apiFetch("/api/v1/users/me");
    expect(removeAuthToken).not.toHaveBeenCalled();
  });
});
