import { describe, expect, it } from "vitest";
import {
  ENTITLEMENT_REQUIRED,
  ENTITLEMENT_REQUIRED_MESSAGE,
  launchErrorPlansTestId,
  toLaunchError,
} from "@/lib/mocks/launch-error";

describe("toLaunchError", () => {
  it("uses the banner message and remembers the paper for ENTITLEMENT_REQUIRED", () => {
    expect(
      toLaunchError(
        {
          ok: false,
          message: "server text",
          status: 403,
          code: ENTITLEMENT_REQUIRED,
        },
        "t1"
      )
    ).toEqual({
      message: ENTITLEMENT_REQUIRED_MESSAGE,
      code: ENTITLEMENT_REQUIRED,
      testId: "t1",
    });
  });

  it("passes other errors through without a test id", () => {
    expect(
      toLaunchError({ ok: false, message: "Nope", code: "OTHER" }, "t1")
    ).toEqual({ message: "Nope", code: "OTHER" });
    expect(toLaunchError({ ok: false, message: "Offline" }, "t1")).toEqual({
      message: "Offline",
    });
  });
});

describe("launchErrorPlansTestId", () => {
  it("returns the paper only for entitlement errors that have one", () => {
    expect(launchErrorPlansTestId(null)).toBeNull();
    expect(launchErrorPlansTestId({ message: "x" })).toBeNull();
    expect(
      launchErrorPlansTestId({ message: "x", code: ENTITLEMENT_REQUIRED })
    ).toBeNull();
    expect(
      launchErrorPlansTestId({
        message: "x",
        code: ENTITLEMENT_REQUIRED,
        testId: "t1",
      })
    ).toBe("t1");
  });
});
