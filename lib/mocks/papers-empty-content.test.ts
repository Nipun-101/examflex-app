import { describe, expect, it } from "vitest";
import { papersEmptyContent } from "@/lib/mocks/papers-empty-content";

describe("papersEmptyContent", () => {
  it("builds chapter-wise copy and a four-step pipeline", () => {
    const content = papersEmptyContent("TOPIC_WISE");
    expect(content.eyebrow).toBe("Your selection");
    expect(content.title).toMatch(/Nothing here yet/i);
    expect(content.body).toMatch(/chapter by chapter/i);
    expect(content.steps).toHaveLength(4);
    expect(content.steps[0]).toMatchObject({
      label: "Chapter picked",
      status: "done",
    });
    expect(content.steps[1]?.status).toBe("current");
    expect(content.tips).toHaveLength(4);
  });

  it("varies the first step and body for full mocks and sprint", () => {
    expect(papersEmptyContent("FULL_EXAM").steps[0]?.label).toBe(
      "Full mock picked"
    );
    expect(papersEmptyContent("FULL_EXAM").body).toMatch(/Full mocks/i);
    expect(papersEmptyContent("SPRINT").steps[0]?.label).toBe("Sprint picked");
    expect(papersEmptyContent("SPRINT").body).toMatch(/Sprint tests/i);
  });
});
