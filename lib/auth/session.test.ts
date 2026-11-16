import { beforeEach, describe, expect, it, vi } from "vitest";

const cookiesMock = vi.fn();
const redirectMock = vi.fn(() => {
  throw new Error("NEXT_REDIRECT");
});

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirectMock(...args),
}));

describe("auth session", () => {
  beforeEach(() => {
    vi.resetModules();
    cookiesMock.mockReset();
    redirectMock.mockClear();
  });

  it("returns null when no auth marker cookie is present", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    const { getSession } = await import("@/lib/auth/session");
    await expect(getSession()).resolves.toBeNull();
  });

  it("returns a marker session when authSession cookie is present", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "authSession" ? { value: "1" } : undefined,
    });
    const { getSession, MARKER_SESSION_USER } = await import(
      "@/lib/auth/session"
    );
    await expect(getSession()).resolves.toEqual({ user: MARKER_SESSION_USER });
  });

  it("accepts legacy authToken cookie as a session marker", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "authToken" ? { value: "legacy" } : undefined,
    });
    const { getSession, MARKER_SESSION_USER } = await import(
      "@/lib/auth/session"
    );
    await expect(getSession()).resolves.toEqual({ user: MARKER_SESSION_USER });
  });

  it("resolves an existing session without redirecting", async () => {
    const { resolveRequiredSession, MARKER_SESSION_USER } = await import(
      "@/lib/auth/session"
    );
    expect(
      resolveRequiredSession({ user: MARKER_SESSION_USER })
    ).toEqual({ user: MARKER_SESSION_USER });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when requireSession has no marker", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });
    const { requireSession } = await import("@/lib/auth/session");
    await expect(requireSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
