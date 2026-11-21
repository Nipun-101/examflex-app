import { describe, expect, it } from "vitest";
import {
  isImageOnlyOption,
  optionHasImage,
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

  it("strips orphaned itemize markers from option copy", () => {
    expect(
      optionLabel(
        {
          id: "a",
          type: "text",
          en: "\\item[(3)] Both incorrect",
          ml: "",
          imageUrl: null,
        },
        "en"
      )
    ).toBe("Both incorrect");
  });
});

describe("option images", () => {
  const option = (
    overrides: Partial<AttemptQuestion["options"][number]>
  ): AttemptQuestion["options"][number] => ({
    id: "o",
    type: "text",
    en: "",
    ml: "",
    imageUrl: null,
    ...overrides,
  });

  it("detects a picture whenever a URL exists, whatever the type", () => {
    expect(optionHasImage(option({ imageUrl: "https://cdn/o.png" }))).toBe(true);
    expect(optionHasImage(option({ type: "image", imageUrl: "https://cdn/o.png" }))).toBe(true);
    expect(optionHasImage(option({ type: "image" }))).toBe(false);
    expect(optionHasImage(option({ en: "text only" }))).toBe(false);
  });

  it("treats picture-only and image-typed options without text as 'letter only'", () => {
    expect(isImageOnlyOption(option({ imageUrl: "https://cdn/o.png" }), "en")).toBe(true);
    expect(isImageOnlyOption(option({ type: "image" }), "en")).toBe(true);
    expect(
      isImageOnlyOption(option({ type: "image", imageUrl: "https://cdn/o.png" }), "ml")
    ).toBe(true);
  });

  it("keeps showing text when an option has any", () => {
    expect(
      isImageOnlyOption(option({ type: "image", en: "Fallback" }), "en")
    ).toBe(false);
    expect(
      isImageOnlyOption(option({ imageUrl: "https://cdn/o.png", ml: "അ" }), "ml")
    ).toBe(false);
    expect(isImageOnlyOption(option({ en: "plain" }), "en")).toBe(false);
  });
});

