import { describe, expect, it } from "vitest";
import {
  evaluatePathwayBand,
  remapPathwaysForPercent,
} from "@/lib/analysis/pathway-bands";
import type { AnalysisPathway } from "@/types/analysis";

describe("pathway-bands", () => {
  it("maps below / borderline / comfortable", () => {
    expect(evaluatePathwayBand(60, 75, 85).band).toBe("below");
    expect(evaluatePathwayBand(78, 75, 85).band).toBe("borderline");
    expect(evaluatePathwayBand(90, 75, 85).band).toBe("comfortable");
  });

  it("remaps pathway messages for a what-if percent", () => {
    const pathways: AnalysisPathway[] = [
      {
        id: "1",
        title: "MBBS",
        minPercent: 80,
        comfortPercent: 90,
        userPercent: 70,
        progress01: 0.8,
        band: "below",
        message: "old",
      },
    ];
    const next = remapPathwaysForPercent(pathways, 92);
    expect(next[0]?.band).toBe("comfortable");
    expect(next[0]?.userPercent).toBe(92);
  });
});
