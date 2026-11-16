import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildQueryString,
  NETWORK_ERROR_MESSAGE,
  requestParsed,
} from "@/lib/api/request";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

describe("buildQueryString", () => {
  it("returns an empty string when there is nothing to send", () => {
    expect(buildQueryString({})).toBe("");
    expect(buildQueryString({ a: undefined, b: "" })).toBe("");
  });

  it("encodes defined values and keeps zero", () => {
    expect(buildQueryString({ page: 1, search: "a b&c", skip: 0 })).toBe(
      "?page=1&search=a+b%26c&skip=0"
    );
  });
});

describe("requestParsed", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parseString = (data: unknown): string | null =>
    typeof data === "string" ? data : null;

  it("returns parsed data and passes the raw envelope", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: "hello", extra: 1 })
    );
    const parse = vi.fn(parseString);
    const result = await requestParsed("/api/x", { method: "GET" }, parse, "f");
    expect(result).toEqual({ ok: true, data: "hello" });
    expect(parse).toHaveBeenCalledWith("hello", {
      message: "ok",
      data: "hello",
      extra: 1,
    });
  });

  it("returns API errors with the server message", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ message: "Nope" }, 403));
    const result = await requestParsed(
      "/api/x",
      { method: "GET" },
      parseString,
      "fallback"
    );
    expect(result).toEqual({ ok: false, status: 403, message: "Nope" });
  });

  it("uses the fallback message when the error body is unreadable", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response("oops", { status: 500 }));
    const result = await requestParsed(
      "/api/x",
      { method: "GET" },
      parseString,
      "fallback"
    );
    expect(result).toEqual({ ok: false, status: 500, message: "fallback" });
  });

  it("fails when the payload does not parse", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: 12 }));
    const result = await requestParsed(
      "/api/x",
      { method: "GET" },
      parseString,
      "fallback"
    );
    expect(result).toEqual({ ok: false, status: 200, message: "fallback" });
  });

  it("returns a network failure when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const result = await requestParsed(
      "/api/x",
      { method: "GET" },
      parseString,
      "fallback"
    );
    expect(result).toEqual({ ok: false, message: NETWORK_ERROR_MESSAGE });
  });
});
