import { describe, expect, it, vi } from "vitest";
import { getAnalysisOverview, parseAnalysisOverview } from "@/lib/api/analysis";

vi.mock("@/lib/api/request", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    requestParsed: vi.fn(
      async (
        path: string,
        init: unknown,
        parse: (data: unknown, raw: unknown) => unknown,
        message: string
      ) => ({ ok: true, data: { path, init, parsed: parse(null, null), message } })
    ),
  };
});

const sample = {
  exam: { id: "e1", name: "NEET UG", totalMarks: 720 },
  fullMocks: {
    completedCount: 1,
    targetCount: 5,
    needsMoreAttempts: true,
    latest: {
      attemptId: "a1",
      title: "Mock 12",
      score: 548,
      maxScore: 720,
      percent: 76.1,
      submittedAt: "2026-01-02T00:00:00.000Z",
      deltaFromPrevious: null,
      correctCount: 140,
      incorrectCount: 30,
      skippedCount: 10,
    },
    recent: [
      {
        attemptId: "a1",
        label: "Mock 1",
        title: "Mock 12",
        score: 548,
        maxScore: 720,
        percent: 76.1,
        submittedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
  },
  pathways: {
    averagePercent: 76.1,
    attemptCountUsed: 1,
    offerings: [
      {
        id: "o1",
        title: "MBBS",
        subtitle: "Medicine",
        status: "EVALUATED",
        yourMarks: 584,
        cutoffMarks: 598,
        comfortMarks: 627.9,
        gapMarks: -14,
        maxMarks: 720,
        attemptsConsidered: 8,
        attemptsInWindow: 10,
        minPercent: 83.1,
        comfortPercent: 87.2,
        userPercent: 81.1,
        progress01: 0.98,
        band: "below",
        message: "14 marks below the cut-off — a strong stretch, keep climbing.",
      },
    ],
  },
  subjects: {
    source: "TOPIC_WISE",
    attemptCount: 0,
    needsMoreAttempts: true,
    items: [],
  },
  engagement: {
    hasFullMocks: true,
    hasChapterWise: false,
    fullMockTarget: 5,
    fullMocksRemaining: 4,
  },
};

describe("parseAnalysisOverview", () => {
  it("parses a valid overview payload", () => {
    const result = parseAnalysisOverview(sample);
    expect(result?.exam.name).toBe("NEET UG");
    expect(result?.fullMocks.latest?.score).toBe(548);
    expect(result?.pathways.offerings[0]?.band).toBe("below");
  });

  it("rejects malformed payloads", () => {
    expect(parseAnalysisOverview(null)).toBeNull();
    expect(parseAnalysisOverview({ exam: { id: "e1" } })).toBeNull();
  });

  describe("pathways", () => {
    const withOffering = (offering: Record<string, unknown>) => ({
      ...sample,
      pathways: { ...sample.pathways, offerings: [offering] },
    });
    const base = sample.pathways.offerings[0] as Record<string, unknown>;

    it("parses the marks-based fields", () => {
      const pathway = parseAnalysisOverview(sample)!.pathways.offerings[0]!;
      expect(pathway).toMatchObject({
        id: "o1",
        title: "MBBS",
        subtitle: "Medicine",
        status: "EVALUATED",
        yourMarks: 584,
        cutoffMarks: 598,
        comfortMarks: 627.9,
        gapMarks: -14,
        maxMarks: 720,
        attemptsConsidered: 8,
        attemptsInWindow: 10,
        band: "below",
      });
    });

    it.each(["NO_ATTEMPTS", "NO_CUTOFF", "EVALUATED"])("accepts status %s", (status) => {
      const pathway = parseAnalysisOverview(
        withOffering({ ...base, status })
      )!.pathways.offerings[0]!;
      expect(pathway.status).toBe(status);
    });

    it("keeps null marks as null (cut-off not announced / no attempts)", () => {
      const pathway = parseAnalysisOverview(
        withOffering({
          ...base,
          status: "NO_CUTOFF",
          cutoffMarks: null,
          comfortMarks: null,
          gapMarks: null,
          maxMarks: null,
        })
      )!.pathways.offerings[0]!;
      expect(pathway.cutoffMarks).toBeNull();
      expect(pathway.comfortMarks).toBeNull();
      expect(pathway.gapMarks).toBeNull();
      expect(pathway.maxMarks).toBeNull();
      expect(pathway.yourMarks).toBe(584);
    });

    it("treats non-numeric marks as null instead of rejecting the payload", () => {
      const pathway = parseAnalysisOverview(
        withOffering({ ...base, yourMarks: "584", cutoffMarks: Number.NaN })
      )!.pathways.offerings[0]!;
      expect(pathway.yourMarks).toBeNull();
      expect(pathway.cutoffMarks).toBeNull();
    });

    it("defaults counts when missing", () => {
      const { attemptsConsidered: _a, attemptsInWindow: _b, ...rest } = base;
      void _a;
      void _b;
      const pathway = parseAnalysisOverview(withOffering(rest))!.pathways
        .offerings[0]!;
      expect(pathway.attemptsConsidered).toBe(0);
      expect(pathway.attemptsInWindow).toBe(0);

      const onlyConsidered = parseAnalysisOverview(
        withOffering({ ...rest, attemptsConsidered: 4 })
      )!.pathways.offerings[0]!;
      expect(onlyConsidered.attemptsInWindow).toBe(4);
    });

    it("derives a status for older payloads that have none", () => {
      const legacyScored = {
        id: "o1",
        title: "MBBS",
        minPercent: 80,
        comfortPercent: 90,
        userPercent: 76.1,
        progress01: 0.95,
        band: "below",
        message: "A strong stretch — keep climbing toward this path.",
      };
      const scored = parseAnalysisOverview(withOffering(legacyScored))!
        .pathways.offerings[0]!;
      expect(scored.status).toBe("EVALUATED");
      expect(scored.yourMarks).toBeNull();
      expect(scored.cutoffMarks).toBeNull();
      expect(scored.minPercent).toBe(80);

      const waiting = parseAnalysisOverview(
        withOffering({ ...legacyScored, userPercent: null })
      )!.pathways.offerings[0]!;
      expect(waiting.status).toBe("NO_ATTEMPTS");
    });

    it("ignores an unknown status value and derives one", () => {
      const pathway = parseAnalysisOverview(
        withOffering({ ...base, status: "WHATEVER" })
      )!.pathways.offerings[0]!;
      expect(pathway.status).toBe("EVALUATED");
    });

    it("drops offerings that are missing required fields but keeps the rest", () => {
      const result = parseAnalysisOverview({
        ...sample,
        pathways: {
          ...sample.pathways,
          offerings: [
            base,
            { ...base, id: "" },
            { ...base, id: "o3", band: "sideways" },
            { ...base, id: "o4", message: undefined },
            null,
          ],
        },
      })!;
      expect(result.pathways.offerings.map((o) => o.id)).toEqual(["o1"]);
    });

    it("omits the subtitle when the API sends none", () => {
      const { subtitle: _s, ...rest } = base;
      void _s;
      const pathway = parseAnalysisOverview(withOffering(rest))!.pathways
        .offerings[0]!;
      expect(pathway).not.toHaveProperty("subtitle");
    });

    it("rejects a payload whose pathways section is malformed", () => {
      expect(
        parseAnalysisOverview({ ...sample, pathways: { offerings: "x" } })
      ).toBeNull();
    });
  });

  describe("other sections", () => {
    const subjectItem = {
      subjectId: "s1",
      subjectName: "Physics",
      attemptCount: 2,
      averagePercent: 60,
      strengthLabel: "Good",
      tip: "Thermo needs another look before your next mock.",
      topics: [
        {
          topicId: "t1",
          topicName: "Thermo",
          attemptCount: 1,
          averagePercent: 30,
          isWeak: true,
          isStrong: false,
        },
      ],
    };

    it("parses subject insights with chapter details", () => {
      const result = parseAnalysisOverview({
        ...sample,
        subjects: {
          source: "TOPIC_WISE",
          attemptCount: 2,
          needsMoreAttempts: false,
          items: [subjectItem],
        },
      })!;
      expect(result.subjects.items[0]).toMatchObject({
        subjectName: "Physics",
        strengthLabel: "Good",
        tip: "Thermo needs another look before your next mock.",
      });
      expect(result.subjects.items[0]!.topics[0]).toMatchObject({
        topicName: "Thermo",
        isWeak: true,
      });
    });

    it("drops subjects with an unknown label and unreadable topics", () => {
      const result = parseAnalysisOverview({
        ...sample,
        subjects: {
          source: "TOPIC_WISE",
          attemptCount: 2,
          needsMoreAttempts: false,
          items: [
            subjectItem,
            { ...subjectItem, subjectId: "s2", strengthLabel: "Meh" },
            {
              ...subjectItem,
              subjectId: "s3",
              topics: [{ topicId: "t", topicName: "x" }],
            },
          ],
        },
      })!;
      // unknown strength label -> dropped; unreadable topics are dropped, subject kept
      expect(result.subjects.items.map((i) => i.subjectId)).toEqual(["s1", "s3"]);
      expect(result.subjects.items[1]!.topics).toEqual([]);
    });

    it("rejects an unknown subjects source or a bad flag", () => {
      expect(
        parseAnalysisOverview({
          ...sample,
          subjects: { ...sample.subjects, source: "FULL_EXAM" },
        })
      ).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          subjects: { ...sample.subjects, needsMoreAttempts: "no" },
        })
      ).toBeNull();
    });

    it("accepts a missing or null latest mock, rejects a malformed one", () => {
      expect(
        parseAnalysisOverview({
          ...sample,
          fullMocks: { ...sample.fullMocks, latest: null },
        })!.fullMocks.latest
      ).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          fullMocks: { ...sample.fullMocks, latest: undefined },
        })!.fullMocks.latest
      ).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          fullMocks: { ...sample.fullMocks, latest: { title: "x" } },
        })
      ).toBeNull();
    });

    it("drops malformed recent attempts and rejects bad counters", () => {
      const result = parseAnalysisOverview({
        ...sample,
        fullMocks: {
          ...sample.fullMocks,
          recent: [sample.fullMocks.recent[0], { attemptId: "x" }],
        },
      })!;
      expect(result.fullMocks.recent).toHaveLength(1);

      expect(
        parseAnalysisOverview({
          ...sample,
          fullMocks: { ...sample.fullMocks, completedCount: "1" },
        })
      ).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          fullMocks: { ...sample.fullMocks, needsMoreAttempts: undefined },
        })
      ).toBeNull();
    });

    it("rejects missing exam identity or engagement", () => {
      expect(
        parseAnalysisOverview({ ...sample, exam: { id: "e1" } })
      ).toBeNull();
      expect(
        parseAnalysisOverview({ ...sample, exam: { name: "NEET" } })
      ).toBeNull();
      expect(parseAnalysisOverview({ ...sample, exam: null })).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          engagement: { ...sample.engagement, hasFullMocks: "yes" },
        })
      ).toBeNull();
      expect(
        parseAnalysisOverview({
          ...sample,
          engagement: { ...sample.engagement, fullMockTarget: undefined },
        })
      ).toBeNull();
    });

    it("keeps the exam's total marks only when numeric", () => {
      expect(parseAnalysisOverview(sample)!.exam.totalMarks).toBe(720);
      expect(
        parseAnalysisOverview({
          ...sample,
          exam: { id: "e1", name: "NEET UG", totalMarks: "720" },
        })!.exam
      ).not.toHaveProperty("totalMarks");
    });
  });

  describe("getAnalysisOverview", () => {
    it("requests the overview for an exam", async () => {
      const result = await getAnalysisOverview("e1");
      expect(result.ok).toBe(true);
      const data = (result as { data: { path: string; init: unknown } }).data;
      expect(data.path).toBe("/api/v1/analysis/overview?examId=e1");
      expect(data.init).toEqual({ method: "GET" });
    });
  });
});
