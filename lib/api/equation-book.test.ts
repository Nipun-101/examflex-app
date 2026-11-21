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

  describe("optional picture", () => {
    const payload = {
      id: "1",
      title: "Force",
      shortDescription: "cue",
      equation: "$$F=ma$$",
      bulletPoints: [],
      subject: { id: "s", name: "Physics" },
      topic: { id: "t", name: "Motion" },
      exams: [{ id: "e", name: "NEET" }],
      isActive: true,
    };

    it("keeps the signed URL when the API sends one", () => {
      const url =
        "https://examflex-images.s3.ap-south-1.amazonaws.com/admin-images/a.png?X-Amz-Signature=abc";
      expect(parseEquationItem({ ...payload, imageUrl: url })?.imageUrl).toBe(url);
    });

    it.each([
      ["missing", undefined],
      ["null (could not be signed)", null],
      ["an empty string", ""],
      ["only whitespace", "   "],
      ["not a string", 42],
    ])("has no picture when imageUrl is %s", (_label, value) => {
      const parsed = parseEquationItem({ ...payload, imageUrl: value });
      expect(parsed).not.toBeNull();
      expect(parsed).not.toHaveProperty("imageUrl");
    });

    it("still parses an equation from an older API that has no image field", () => {
      const parsed = parseEquationItem(payload);
      expect(parsed).toMatchObject({ id: "1", title: "Force" });
      expect(parsed).not.toHaveProperty("imageUrl");
    });
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
