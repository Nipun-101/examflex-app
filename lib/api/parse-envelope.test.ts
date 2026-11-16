import { describe, expect, it } from "vitest";
import {
  failApiResult,
  isApiRecord,
  networkApiFailure,
  readJsonBody,
  unwrapApiData,
} from "@/lib/api/parse-envelope";

describe("parse-envelope helpers", () => {
  it("detects records and unwraps data", () => {
    expect(isApiRecord({ a: 1 })).toBe(true);
    expect(isApiRecord(null)).toBe(false);
    expect(unwrapApiData({ data: { id: "1" } })).toEqual({ id: "1" });
    expect(unwrapApiData({ data: null })).toBeNull();
    expect(unwrapApiData("x")).toBeNull();
  });

  it("reads JSON bodies and builds failures", async () => {
    const ok = new Response(JSON.stringify({ message: "hi" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    expect(await readJsonBody(ok)).toEqual({ message: "hi" });

    const bad = new Response("not-json", { status: 500 });
    expect(await readJsonBody(bad)).toBeNull();

    expect(failApiResult({ message: "Nope" }, 400, "fallback")).toEqual({
      ok: false,
      status: 400,
      message: "Nope",
    });
    expect(failApiResult({}, 500, "fallback")).toEqual({
      ok: false,
      status: 500,
      message: "fallback",
    });
    expect(networkApiFailure("offline")).toEqual({
      ok: false,
      message: "offline",
    });
  });
});
