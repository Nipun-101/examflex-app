import { describe, expect, it } from "vitest";
import {
  attemptPath,
  examHubPath,
  examTestExitLabel,
  examTestListPath,
  mistakeBookPath,
} from "@/lib/mocks/exam-test-routes";

describe("examHubPath", () => {
  it("builds the hub path and encodes the id", () => {
    expect(examHubPath("e1")).toBe("/mocks/exam/e1");
    expect(examHubPath("a/b c")).toBe("/mocks/exam/a%2Fb%20c");
  });
});

describe("attemptPath", () => {
  it("builds the attempt path and encodes the id", () => {
    expect(attemptPath("a1")).toBe("/mocks/attempt/a1");
    expect(attemptPath("a/1")).toBe("/mocks/attempt/a%2F1");
  });
});

describe("examTestListPath", () => {
  it("routes each paper type to its list", () => {
    expect(examTestListPath("e1", "TOPIC_WISE")).toBe(
      "/mocks/exam/e1/chapter-wise"
    );
    expect(examTestListPath("e1", "FULL_EXAM")).toBe(
      "/mocks/exam/e1/full-mocks"
    );
    expect(examTestListPath("e1", "SPRINT")).toBe(
      "/mocks/exam/e1/sprint-tests"
    );
  });

  it("falls back to chapter-wise for missing or unknown types", () => {
    expect(examTestListPath("e1")).toBe("/mocks/exam/e1/chapter-wise");
    expect(examTestListPath("e1", null)).toBe("/mocks/exam/e1/chapter-wise");
    expect(examTestListPath("e1", "")).toBe("/mocks/exam/e1/chapter-wise");
    expect(examTestListPath("e1", "OTHER")).toBe(
      "/mocks/exam/e1/chapter-wise"
    );
  });

  it("can treat a missing type as a full mock", () => {
    const options = { treatMissingAsFullMock: true };
    expect(examTestListPath("e1", undefined, options)).toBe(
      "/mocks/exam/e1/full-mocks"
    );
    expect(examTestListPath("e1", null, options)).toBe(
      "/mocks/exam/e1/full-mocks"
    );
    expect(examTestListPath("e1", "TOPIC_WISE", options)).toBe(
      "/mocks/exam/e1/chapter-wise"
    );
    expect(examTestListPath("e1", "SPRINT", options)).toBe(
      "/mocks/exam/e1/sprint-tests"
    );
    expect(
      examTestListPath("e1", undefined, { treatMissingAsFullMock: false })
    ).toBe("/mocks/exam/e1/chapter-wise");
  });
});

describe("examTestExitLabel", () => {
  it("labels each destination", () => {
    expect(examTestExitLabel("TOPIC_WISE")).toBe("Exit to Chapter Wise");
    expect(examTestExitLabel("FULL_EXAM")).toBe("Exit to Full Mocks");
    expect(examTestExitLabel("SPRINT")).toBe("Exit to Sprint Tests");
    expect(examTestExitLabel()).toBe("Exit to Chapter Wise");
    expect(examTestExitLabel(null)).toBe("Exit to Chapter Wise");
  });

  it("can treat a missing type as a full mock", () => {
    expect(examTestExitLabel(undefined, { treatMissingAsFullMock: true })).toBe(
      "Exit to Full Mocks"
    );
  });
});

describe("mistakeBookPath", () => {
  it("builds the Mistake Book review path and encodes the id", () => {
    expect(mistakeBookPath("m1")).toBe("/mistake-book/m1");
    expect(mistakeBookPath("a/b")).toBe("/mistake-book/a%2Fb");
  });
});
