import { describe, expect, it } from "vitest";
import {
  failApiResult,
  isApiRecord,
  networkApiFailure,
  parseApiErrorCode,
  readJsonBody,
  sanitizeApiMessage,
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
    expect(
      failApiResult(
        { message: "Denied", details: { code: "ENTITLEMENT_REQUIRED" } },
        403,
        "fallback"
      )
    ).toEqual({
      ok: false,
      status: 403,
      message: "Denied",
      code: "ENTITLEMENT_REQUIRED",
    });
    expect(parseApiErrorCode({ details: { code: " " } })).toBeUndefined();
    expect(parseApiErrorCode({ details: { code: 1 } })).toBeUndefined();
    expect(parseApiErrorCode({ details: "x" })).toBeUndefined();
    expect(parseApiErrorCode(null)).toBeUndefined();
    expect(networkApiFailure("offline")).toEqual({
      ok: false,
      message: "offline",
    });

    expect(
      failApiResult(
        {
          message:
            "input must be a 24 character hex string, 12 byte Uint8Array, or an integer",
        },
        500,
        "Could not load chapter-wise tests. Please try again."
      )
    ).toEqual({
      ok: false,
      status: 500,
      message: "Could not load chapter-wise tests. Please try again.",
    });
    expect(sanitizeApiMessage("Invalid _id: undefined", "fallback")).toBe(
      "fallback"
    );
    expect(sanitizeApiMessage("Exam not found", "fallback")).toBe(
      "Exam not found"
    );
  });
});
