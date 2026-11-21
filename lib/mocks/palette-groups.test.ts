import { describe, expect, it } from "vitest";
import {
  buildPaletteGroups,
  isFullMockAttempt,
} from "@/lib/mocks/palette-groups";
import { makeMockTestData, makeQuestion } from "@/test-utils/attempt-fixtures";

const fullMock = makeMockTestData({
  paperType: "FULL_EXAM",
  subject: undefined,
});

const q = (id: string, subject: string, subjectName?: string) =>
  makeQuestion(id, { subject, ...(subjectName ? { subjectName } : {}) });

describe("isFullMockAttempt", () => {
  it("is true for FULL_EXAM and for legacy payloads with no subject/topic", () => {
    expect(isFullMockAttempt(fullMock)).toBe(true);
    const legacy = makeMockTestData({ subject: undefined });
    delete (legacy as { paperType?: string }).paperType;
    expect(isFullMockAttempt(legacy)).toBe(true);
  });

  it("is false for topic-wise and sprint papers", () => {
    expect(isFullMockAttempt(makeMockTestData())).toBe(false);
    expect(
      isFullMockAttempt(
        makeMockTestData({ paperType: "SPRINT", subject: undefined }),
      ),
    ).toBe(false);
  });
});

describe("buildPaletteGroups", () => {
  const questions = [
    q("1", "phy", "Physics"),
    q("2", "phy", "Physics"),
    q("3", "chem", "Chemistry"),
    q("4", "bot", "Botany"),
  ];

  it("groups full-mock questions by subject in order, keeping paper indices", () => {
    expect(buildPaletteGroups(fullMock, questions)).toEqual([
      { id: "phy", name: "Physics", indices: [0, 1] },
      { id: "chem", name: "Chemistry", indices: [2] },
      { id: "bot", name: "Botany", indices: [3] },
    ]);
  });

  it("puts interleaved questions under their own subject", () => {
    const mixed = [
      q("1", "phy", "Physics"),
      q("2", "chem", "Chemistry"),
      q("3", "phy", "Physics"),
    ];
    expect(buildPaletteGroups(fullMock, mixed)).toEqual([
      { id: "phy", name: "Physics", indices: [0, 2] },
      { id: "chem", name: "Chemistry", indices: [1] },
    ]);
  });

  it("returns null for non-full-mock papers", () => {
    expect(buildPaletteGroups(makeMockTestData(), questions)).toBeNull();
    expect(
      buildPaletteGroups(
        makeMockTestData({ paperType: "SPRINT", subject: undefined }),
        questions,
      ),
    ).toBeNull();
  });

  it("returns null for session-wise papers and single-subject papers", () => {
    expect(
      buildPaletteGroups({ ...fullMock, isSessionWise: true }, questions),
    ).toBeNull();
    expect(
      buildPaletteGroups(fullMock, [q("1", "phy"), q("2", "phy")]),
    ).toBeNull();
  });

  it("falls back to flat when a question has no subject id", () => {
    expect(
      buildPaletteGroups(fullMock, [
        q("1", "phy", "Physics"),
        q("2", "chem", "Chemistry"),
        q("3", ""),
      ]),
    ).toBeNull();
  });

  it("names a group by position when the API sent no subject name", () => {
    expect(
      buildPaletteGroups(fullMock, [q("1", "a"), q("2", "b")])?.map(
        (g) => g.name,
      ),
    ).toEqual(["Section 1", "Section 2"]);
  });
});
