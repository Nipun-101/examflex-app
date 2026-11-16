import { afterEach, describe, expect, it } from "vitest";
import { apiUrl, getApiBaseUrl } from "@/lib/api/config";

describe("api config", () => {
  const previous = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = previous;
    }
  });

  it("returns the configured API origin", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
    expect(getApiBaseUrl()).toBe("http://localhost:3000");
    expect(apiUrl("/api/v1/auth/refresh")).toBe(
      "http://localhost:3000/api/v1/auth/refresh"
    );
    expect(apiUrl("api/v1/auth/logout")).toBe(
      "http://localhost:3000/api/v1/auth/logout"
    );
  });

  it("throws when the API URL is missing", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(() => getApiBaseUrl()).toThrow(/NEXT_PUBLIC_API_URL is not set/);
  });

  it("throws when the API URL is invalid", () => {
    process.env.NEXT_PUBLIC_API_URL = "not a url";
    expect(() => getApiBaseUrl()).toThrow(/not a valid URL/);
  });
});
