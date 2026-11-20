import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCounselingRequest, getMyCounseling, parseCounselingMe } from "./counseling";

vi.mock("@/lib/api/request", () => ({
  requestParsed: vi.fn(),
}));

import { requestParsed } from "@/lib/api/request";

const request = vi.mocked(requestParsed);

describe("parseCounselingMe", () => {
  it("parses canRequest with no active booking", () => {
    expect(
      parseCounselingMe({ canRequest: true, activeRequest: null })
    ).toEqual({ canRequest: true, activeRequest: null });
  });

  it("parses an active booking", () => {
    expect(
      parseCounselingMe({
        canRequest: false,
        activeRequest: {
          id: "r1",
          status: "booked",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      })
    ).toEqual({
      canRequest: false,
      activeRequest: {
        id: "r1",
        status: "booked",
        createdAt: "2026-04-01T00:00:00.000Z",
      },
    });
  });

  it("rejects completed as an active status", () => {
    expect(
      parseCounselingMe({
        canRequest: false,
        activeRequest: {
          id: "r1",
          status: "completed",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      })
    ).toBeNull();
  });
});

describe("counseling API helpers", () => {
  beforeEach(() => {
    request.mockReset();
  });

  it("loads counseling me", async () => {
    request.mockResolvedValue({
      ok: true,
      data: { canRequest: true, activeRequest: null },
    });
    await getMyCounseling();
    expect(request).toHaveBeenCalledWith(
      "/api/v1/counseling/me",
      { method: "GET" },
      parseCounselingMe,
      "Could not load counseling status."
    );
  });

  it("creates a counseling request", async () => {
    request.mockResolvedValue({ ok: true, data: { id: "r1" } });
    await createCounselingRequest({
      whoWillJoin: "student",
      contact: { emailEnabled: true, email: "a@b.com", phoneEnabled: false },
    });
    expect(request).toHaveBeenCalledWith(
      "/api/v1/counseling",
      expect.objectContaining({ method: "POST" }),
      expect.any(Function),
      "Could not submit your counseling request."
    );
  });
});
