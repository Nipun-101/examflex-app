import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseBadgesSummary } from "@/lib/api/analytics";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const summary = {
  earnedCount: 1,
  totalCount: 2,
  badges: [
    {
      id: "first-test",
      name: "First Test",
      description: "Complete your first mock test",
      category: "Milestone",
      criteria: "Complete 1 test",
      isEarned: true,
    },
    {
      id: "streak-7",
      name: "7-Day Streak",
      description: "Maintain a 7-day streak",
      category: "Consistency",
      criteria: "7-day streak",
      isEarned: false,
    },
  ],
};

describe("parseBadgesSummary", () => {
  it("parses a badges payload", () => {
    expect(parseBadgesSummary(summary)).toEqual(summary);
  });

  it("drops invalid badge rows and rejects bad envelopes", () => {
    expect(
      parseBadgesSummary({
        ...summary,
        badges: [
          summary.badges[0],
          { id: "x" },
          {
            id: "bad",
            name: "Bad",
            description: "d",
            category: "Milestone",
            criteria: "c",
            isEarned: "yes",
          },
        ],
      })
    ).toEqual({
      earnedCount: 1,
      totalCount: 2,
      badges: [summary.badges[0]],
    });
    expect(parseBadgesSummary(null)).toBeNull();
    expect(parseBadgesSummary({ badges: [] })).toBeNull();
    expect(parseBadgesSummary({ badges: "x", earnedCount: 0, totalCount: 0 })).toBeNull();
    expect(
      parseBadgesSummary({
        badges: [null, "x"],
        earnedCount: 0,
        totalCount: 2,
      })
    ).toEqual({ badges: [], earnedCount: 0, totalCount: 2 });
  });
});

describe("getBadges", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns badges on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "ok", data: summary }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { getBadges } = await import("@/lib/api/analytics");
    expect(await getBadges()).toEqual({ ok: true, data: summary });
  });

  it("returns an error message on failure", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ message: "Badges unavailable" }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { getBadges } = await import("@/lib/api/analytics");
    expect(await getBadges()).toEqual({
      ok: false,
      status: 503,
      message: "Badges unavailable",
    });
  });

  it("rejects ok responses with invalid bodies and network errors", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "ok", data: { badges: [] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { getBadges } = await import("@/lib/api/analytics");
    expect((await getBadges()).ok).toBe(false);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    const network = await getBadges();
    expect(network.ok).toBe(false);
  });
});
