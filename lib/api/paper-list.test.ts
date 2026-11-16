import { describe, expect, it } from "vitest";
import {
  parseAccessMode,
  parsePaginatedList,
  parsePagination,
  parsePaperAccess,
  parsePaperExamRef,
  parsePaperListBase,
  parseUserAttemptAction,
} from "@/lib/api/paper-list";

const pagination = {
  total: 25,
  page: 2,
  limit: 10,
  totalPages: 3,
  hasNextPage: true,
  hasPrevPage: true,
};

const baseItem = {
  id: "p1",
  title: "Kinematics",
  description: "Motion in a line",
  totalQuestions: 20,
  durationInMinutes: 30,
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: 40,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("enum parsers", () => {
  it("parses access modes", () => {
    expect(parseAccessMode("FREE")).toBe("FREE");
    expect(parseAccessMode("ENTITLED")).toBe("ENTITLED");
    expect(parseAccessMode("PAID")).toBeUndefined();
    expect(parseAccessMode(undefined)).toBeUndefined();
  });

  it("parses attempt actions", () => {
    expect(parseUserAttemptAction("START")).toBe("START");
    expect(parseUserAttemptAction("RETAKE")).toBe("RETAKE");
    expect(parseUserAttemptAction("RESUME")).toBe("RESUME");
    expect(parseUserAttemptAction("PAUSE")).toBeUndefined();
    expect(parseUserAttemptAction(1)).toBeUndefined();
  });
});

describe("parsePaperAccess", () => {
  it("parses allowed and denied access", () => {
    expect(parsePaperAccess({ allowed: false, reason: "NO_ENTITLEMENT" })).toEqual(
      { allowed: false, reason: "NO_ENTITLEMENT" }
    );
    expect(parsePaperAccess({ allowed: true })).toEqual({
      allowed: true,
      reason: "",
    });
  });

  it("ignores malformed access", () => {
    expect(parsePaperAccess(null)).toBeUndefined();
    expect(parsePaperAccess("yes")).toBeUndefined();
    expect(parsePaperAccess({ allowed: "no", reason: "x" })).toBeUndefined();
  });
});

describe("parsePagination", () => {
  it("parses a valid block", () => {
    expect(parsePagination(pagination)).toEqual(pagination);
  });

  it.each([
    ["not an object", null],
    ["missing total", { ...pagination, total: undefined }],
    ["bad page", { ...pagination, page: "1" }],
    ["bad limit", { ...pagination, limit: Number.NaN }],
    ["bad totalPages", { ...pagination, totalPages: null }],
    ["bad hasNextPage", { ...pagination, hasNextPage: "yes" }],
    ["bad hasPrevPage", { ...pagination, hasPrevPage: 0 }],
  ])("rejects %s", (_label, value) => {
    expect(parsePagination(value)).toBeNull();
  });
});

describe("parsePaperExamRef", () => {
  it("parses with and without description", () => {
    expect(parsePaperExamRef({ id: "e1", name: "NEET", description: "d" })).toEqual(
      { id: "e1", name: "NEET", description: "d" }
    );
    expect(parsePaperExamRef({ id: "e1", name: "NEET" })).toEqual({
      id: "e1",
      name: "NEET",
    });
  });

  it("rejects invalid refs", () => {
    expect(parsePaperExamRef(null)).toBeNull();
    expect(parsePaperExamRef({ id: 1, name: "NEET" })).toBeNull();
    expect(parsePaperExamRef({ id: "e1" })).toBeNull();
  });
});

describe("parsePaperListBase", () => {
  it("parses a full item", () => {
    expect(
      parsePaperListBase({
        ...baseItem,
        accessMode: "ENTITLED",
        access: { allowed: false, reason: "NO_ENTITLEMENT" },
        userAttemptAction: "RESUME",
        resumeAttemptId: "a1",
      })
    ).toEqual({
      ...baseItem,
      accessMode: "ENTITLED",
      access: { allowed: false, reason: "NO_ENTITLEMENT" },
      userAttemptAction: "RESUME",
      resumeAttemptId: "a1",
    });
  });

  it("normalizes missing optionals", () => {
    const parsed = parsePaperListBase({
      ...baseItem,
      title: undefined,
      description: null,
      passingScore: undefined,
    });
    expect(parsed).toEqual({
      ...baseItem,
      title: null,
      description: null,
      passingScore: null,
    });
    expect(parsed).not.toHaveProperty("access");
    expect(parsed).not.toHaveProperty("accessMode");
    expect(parsed).not.toHaveProperty("userAttemptAction");
    expect(parsed).not.toHaveProperty("resumeAttemptId");
  });

  it.each([
    ["id", { id: 1 }],
    ["createdAt", { createdAt: undefined }],
    ["updatedAt", { updatedAt: 5 }],
    ["totalQuestions", { totalQuestions: "20" }],
    ["durationInMinutes", { durationInMinutes: null }],
    ["marksPerQuestion", { marksPerQuestion: undefined }],
    ["negativeMarking", { negativeMarking: "1" }],
    ["allowRetake", { allowRetake: "yes" }],
    ["shuffleOptions", { shuffleOptions: 0 }],
    ["showResultsImmediately", { showResultsImmediately: null }],
    ["isActive", { isActive: "true" }],
  ])("rejects invalid %s", (_field, patch) => {
    expect(parsePaperListBase({ ...baseItem, ...patch })).toBeNull();
  });
});

describe("parsePaginatedList", () => {
  const parseId = (item: unknown): string | null =>
    typeof item === "object" &&
    item !== null &&
    "id" in item &&
    typeof item.id === "string"
      ? item.id
      : null;

  it("parses items and pagination, dropping bad items", () => {
    expect(
      parsePaginatedList(
        { data: [{ id: "a" }, { id: 1 }, null, { id: "b" }], pagination },
        parseId
      )
    ).toEqual({ data: ["a", "b"], pagination });
  });

  it("fails for non-objects, missing data or missing pagination", () => {
    expect(parsePaginatedList(null, parseId)).toBeNull();
    expect(parsePaginatedList({ pagination }, parseId)).toBeNull();
    expect(parsePaginatedList({ data: [] }, parseId)).toBeNull();
    expect(
      parsePaginatedList({ data: {}, pagination }, parseId)
    ).toBeNull();
  });
});
