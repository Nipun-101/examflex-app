import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getExamById,
  getExamsByCategory,
  parseExam,
  parseExamCategory,
  parseExamDetail,
  parseExamsByCategory,
} from "@/lib/api/exams";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const exam = {
  id: "e1",
  title: "NEET",
  fullName: "National Eligibility cum Entrance Test",
  duration: "3h 20min",
  totalQuestions: 180,
  totalMarks: 720,
  testsCount: 12,
  subjectsCount: 3,
  trending: true,
};

const category = {
  id: "c1",
  name: "Medical",
  shortName: "MED",
  imageUrl: "https://img.test/med.png",
  description: "Medical entrance",
  exams: [exam],
};

const detail = {
  id: "e1",
  name: "NEET",
  description: "National Eligibility cum Entrance Test",
  duration: 200,
  totalQuestions: 180,
  totalMarks: 720,
  isSessionWise: true,
  hasMultiLingualSupport: true,
  isActive: true,
  subjects: [
    {
      subject: "s1",
      name: "Physics",
      numberOfQuestions: 45,
      marksPerQuestion: 4,
      hasNegativeMarking: true,
      negativeMarksPerQuestion: 1,
      sessionTime: 50,
    },
  ],
  performanceBands: [{ key: "excellent", minPercent: 80 }],
};

describe("parseExam", () => {
  it("parses a full exam", () => {
    expect(parseExam(exam)).toEqual(exam);
  });

  it("accepts null duration and marks", () => {
    expect(
      parseExam({
        ...exam,
        duration: null,
        totalQuestions: null,
        totalMarks: null,
        trending: undefined,
      })
    ).toMatchObject({
      duration: null,
      totalQuestions: null,
      totalMarks: null,
      trending: false,
    });
  });

  it("applies defaults for missing optional fields", () => {
    expect(parseExam({ id: "e1", title: "NEET" })).toEqual({
      id: "e1",
      title: "NEET",
      fullName: "",
      duration: null,
      totalQuestions: null,
      totalMarks: null,
      testsCount: 0,
      subjectsCount: 0,
      trending: false,
    });
  });

  it("rejects invalid exams", () => {
    expect(parseExam(null)).toBeNull();
    expect(parseExam({ id: 1, title: "NEET" })).toBeNull();
    expect(parseExam({ id: "e1", title: 2 })).toBeNull();
  });
});

describe("parseExamCategory / parseExamsByCategory", () => {
  it("parses categories with exams", () => {
    expect(parseExamCategory(category)).toEqual(category);
    expect(parseExamsByCategory([category])).toEqual([category]);
  });

  it("defaults text fields and tolerates empty or bad exams", () => {
    expect(parseExamCategory({ id: "c1", name: "Medical" })).toEqual({
      id: "c1",
      name: "Medical",
      shortName: "",
      imageUrl: "",
      description: "",
      exams: [],
    });
    expect(
      parseExamCategory({ ...category, exams: [exam, { id: 1 }] })?.exams
    ).toEqual([exam]);
  });

  it("rejects invalid categories and drops them from lists", () => {
    expect(parseExamCategory(null)).toBeNull();
    expect(parseExamCategory({ id: "c1" })).toBeNull();
    expect(parseExamCategory({ name: "x" })).toBeNull();
    expect(parseExamsByCategory({})).toBeNull();
    expect(parseExamsByCategory([category, { id: 1 }])).toEqual([category]);
  });
});

describe("parseExamDetail", () => {
  it("parses a full detail payload", () => {
    expect(parseExamDetail(detail)).toEqual(detail);
  });

  it("parses a minimal payload", () => {
    const parsed = parseExamDetail({ id: "e1", name: "NEET" });
    expect(parsed).toEqual({
      id: "e1",
      name: "NEET",
      isSessionWise: false,
      hasMultiLingualSupport: false,
      isActive: false,
    });
    expect(parsed).not.toHaveProperty("subjects");
    expect(parsed).not.toHaveProperty("performanceBands");
  });

  it("applies subject defaults and drops invalid subjects and bands", () => {
    const parsed = parseExamDetail({
      id: "e1",
      name: "NEET",
      subjects: [
        { subject: "s1", numberOfQuestions: 45, marksPerQuestion: 4 },
        null,
        { subject: 1, numberOfQuestions: 45, marksPerQuestion: 4 },
        { subject: "s2", numberOfQuestions: "45", marksPerQuestion: 4 },
        { subject: "s3", numberOfQuestions: 45 },
      ],
      performanceBands: [
        { key: "good", minPercent: 60 },
        null,
        { key: 1, minPercent: 10 },
        { key: "bad" },
      ],
    });
    expect(parsed?.subjects).toEqual([
      {
        subject: "s1",
        numberOfQuestions: 45,
        marksPerQuestion: 4,
        hasNegativeMarking: false,
        negativeMarksPerQuestion: 0,
      },
    ]);
    expect(parsed?.performanceBands).toEqual([
      { key: "good", minPercent: 60 },
    ]);
  });

  it("rejects invalid details", () => {
    expect(parseExamDetail(null)).toBeNull();
    expect(parseExamDetail({ id: "e1" })).toBeNull();
    expect(parseExamDetail({ id: 1, name: "NEET" })).toBeNull();
  });
});

describe("getExamsByCategory / getExamById", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  it("loads categories", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: [category] })
    );
    const result = await getExamsByCategory();
    expect(result).toEqual({ ok: true, data: [category] });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/exams/by-category",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns API errors for categories", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "Server busy" }, 503)
    );
    expect(await getExamsByCategory()).toEqual({
      ok: false,
      status: 503,
      message: "Server busy",
    });
  });

  it("fails on malformed category payloads", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ data: { not: "list" } }));
    const result = await getExamsByCategory();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/could not load exams/i);
    }
  });

  it("returns a network failure when fetch throws", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("offline"));
    const result = await getExamsByCategory();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toMatch(/reach ExamFlex/i);
    }
  });

  it("loads an exam by id and encodes the id", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", data: detail })
    );
    const result = await getExamById("e 1");
    expect(result).toEqual({ ok: true, data: detail });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/exams/e%201",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns not found and malformed errors for an exam", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Exam not found" }, 404)
    );
    expect(await getExamById("missing")).toEqual({
      ok: false,
      status: 404,
      message: "Exam not found",
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: { id: 1 } }));
    const bad = await getExamById("e1");
    expect(bad.ok).toBe(false);
  });
});
