import { describe, expect, it } from "vitest";
import { SUPPORT_HELP_TOPICS } from "@/lib/support/help-topics";
import { SUPPORT_PATHS } from "@/lib/support/support-links";

describe("SUPPORT_HELP_TOPICS", () => {
  it("lists unique topics with in-page or contact targets", () => {
    const ids = SUPPORT_HELP_TOPICS.map((topic) => topic.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SUPPORT_HELP_TOPICS.some((topic) => topic.href === SUPPORT_PATHS.contact)).toBe(
      true
    );
    expect(
      SUPPORT_HELP_TOPICS.every(
        (topic) => topic.href.startsWith("#") || topic.href.startsWith("/")
      )
    ).toBe(true);
  });
});
