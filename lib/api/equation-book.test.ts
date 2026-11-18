import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "@/lib/api/client";
import { listEquations, parseEquationItem } from "@/lib/api/equation-book";

describe("parseEquationItem", () => {
  it("parses a valid equation payload", () => {
    expect(
      parseEquationItem({
        id: "1",
        title: "Force",
        shortDescription: "cue",
        equation: "$$F=ma$$",
        bulletPoints: ["a"],
        subject: { id: "s", name: "Physics" },
        topic: { id: "t", name: "Motion" },
        exams: [{ id: "e", name: "NEET" }],
        isActive: true,
      })
    ).toMatchObject({ id: "1", title: "Force" });
  });

  it("rejects incomplete payloads", () => {
    expect(parseEquationItem({ id: "1" })).toBeNull();
  });
});

describe("listEquations", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("requests filtered equations", async () => {
    vi.mocked(apiFetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "ok",
          data: [
            {
              id: "1",
              title: "Force",
              shortDescription: "cue",
              equation: "$$F=ma$$",
              bulletPoints: [],
              subject: { id: "s", name: "Physics" },
              topic: { id: "t", name: "Motion" },
              exams: [{ id: "e", name: "NEET" }],
              isActive: true,
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 20,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        }),
        { status: 200 }
      )
    );

    const result = await listEquations({
      examId: "e",
      subjectId: "s",
      topicId: "t",
      search: "force",
    });
    expect(result.ok).toBe(true);
    expect(apiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/equation-book?"),
      expect.objectContaining({ method: "GET" })
    );
  });
});
