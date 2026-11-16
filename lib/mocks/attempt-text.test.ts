import { describe, expect, it } from "vitest";
import {
  optionLabel,
  questionImageUrl,
  questionStem,
} from "@/lib/mocks/attempt-text";
import type { AttemptQuestion } from "@/types/attempt";

function question(
  en: { text: string; imageUrl: string | null },
  ml: { text: string; imageUrl: string | null }
): AttemptQuestion {
  return { _id: "q", questionText: { en, ml }, options: [], subject: "PHY" };
}

describe("questionStem", () => {
  it("returns the requested language", () => {
    const q = question(
      { text: "English", imageUrl: null },
      { text: "മലയാളം", imageUrl: null }
    );
    expect(questionStem(q, "ml")).toBe("മലയാളം");
    expect(questionStem(q, "en")).toBe("English");
  });

  it("falls back across languages", () => {
    expect(
      questionStem(
        question({ text: "English", imageUrl: null }, { text: "", imageUrl: null }),
        "ml"
      )
    ).toBe("English");
    expect(
      questionStem(
        question({ text: "", imageUrl: null }, { text: "മലയാളം", imageUrl: null }),
        "en"
      )
    ).toBe("മലയാളം");
  });
});

describe("questionImageUrl", () => {
  it("prefers the language image then falls back", () => {
    const q = question(
      { text: "a", imageUrl: "en.png" },
      { text: "b", imageUrl: "ml.png" }
    );
    expect(questionImageUrl(q, "ml")).toBe("ml.png");
    expect(
      questionImageUrl(
        question({ text: "a", imageUrl: "en.png" }, { text: "b", imageUrl: null }),
        "ml"
      )
    ).toBe("en.png");
    expect(
      questionImageUrl(
        question({ text: "a", imageUrl: null }, { text: "b", imageUrl: "ml.png" }),
        "en"
      )
    ).toBe("ml.png");
    expect(
      questionImageUrl(
        question({ text: "a", imageUrl: null }, { text: "b", imageUrl: null }),
        "en"
      )
    ).toBeNull();
  });
});

describe("optionLabel", () => {
  const option = { id: "a", type: "text" as const, en: "Four", ml: "", imageUrl: null };
  it("falls back when the language is blank", () => {
    expect(optionLabel(option, "ml")).toBe("Four");
    expect(optionLabel({ ...option, en: "", ml: "നാല്" }, "en")).toBe("നാല്");
    expect(optionLabel({ ...option, ml: "നാല്" }, "ml")).toBe("നാല്");
  });
});
