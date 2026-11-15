import { describe, expect, it } from "vitest";
import {
  APP_DESCRIPTION,
  APP_DOMAIN,
  APP_NAME,
  APP_STUDY_TAGLINE,
  APP_TAGLINE,
  NAV_LINKS,
} from "@/lib/constants";

describe("constants", () => {
  it("exports ExamFlex product identity", () => {
    expect(APP_NAME).toBe("ExamFlex");
    expect(APP_TAGLINE).toBe("Rise above cutoffs.");
    expect(APP_STUDY_TAGLINE).toBe("A little better, every attempt.");
    expect(APP_DOMAIN).toBe("examflex.in");
    expect(APP_DESCRIPTION.toLowerCase()).toContain("neet");
    expect(APP_DESCRIPTION.toLowerCase()).toContain("jee");
  });

  it("defines primary navigation anchors", () => {
    expect(NAV_LINKS).toHaveLength(4);
    expect(NAV_LINKS.map((link) => link.label)).toEqual([
      "Home",
      "Courses",
      "Tests",
      "Performance",
    ]);
  });
});
