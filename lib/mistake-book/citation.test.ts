import { describe, expect, it } from "vitest";
import {
  splitCitationFigures,
  visibleCitation,
} from "@/lib/mistake-book/citation";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import type { MistakeCitation, MistakeItem } from "@/types/mistake-book";

const base = MISTAKE_BOOK_DATA.mistakes[0]!;
const citation: MistakeCitation = {
  title: "Potassium Dichromate",
  content: "Dichromate text",
  images: [],
};

function withCitation(patch: Partial<MistakeItem>): MistakeItem {
  return { ...base, ...patch };
}

describe("visibleCitation", () => {
  it("returns the citation when status is done and it has text", () => {
    expect(
      visibleCitation(withCitation({ citationStatus: "done", citation }))
    ).toBe(citation);
  });

  it.each(["pending", "failed", "skipped"] as const)(
    "hides the citation when status is %s",
    (status) => {
      expect(
        visibleCitation(withCitation({ citationStatus: status, citation }))
      ).toBeNull();
    }
  );

  it("hides when status or citation is missing", () => {
    expect(visibleCitation(withCitation({ citation }))).toBeNull();
    expect(visibleCitation(withCitation({ citationStatus: "done" }))).toBeNull();
  });

  it("hides when title or content is blank", () => {
    expect(
      visibleCitation(
        withCitation({
          citationStatus: "done",
          citation: { ...citation, title: "  " },
        })
      )
    ).toBeNull();
    expect(
      visibleCitation(
        withCitation({
          citationStatus: "done",
          citation: { ...citation, content: "" },
        })
      )
    ).toBeNull();
  });
});

describe("splitCitationFigures", () => {
  const content = [
    "Intro paragraph.",
    "",
    "<figure>figure-7<caption>Chromate ion</caption><description>A chromate ion structure.</description></figure>",
    "",
    "<figure>figure-8<caption>Dichromate ion</caption><description>Two tetrahedra sharing a corner.</description></figure>",
    "",
    "The structures are shown below.",
  ].join("\n");

  it("removes figure blocks from the text", () => {
    const { text } = splitCitationFigures(content, []);
    expect(text).toBe("Intro paragraph.\n\nThe structures are shown below.");
    expect(text).not.toMatch(/figure|caption/i);
  });

  it("matches captions to images by file name", () => {
    const { figures } = splitCitationFigures(content, [
      "https://cdn.test/Chapter/figure-8.jpg",
      "https://cdn.test/Chapter/figure-7.jpg?v=2",
      "https://cdn.test/Chapter/extra.png",
    ]);
    expect(figures).toEqual([
      {
        src: "https://cdn.test/Chapter/figure-8.jpg",
        alt: "Two tetrahedra sharing a corner.",
        caption: "Dichromate ion",
      },
      {
        src: "https://cdn.test/Chapter/figure-7.jpg?v=2",
        alt: "A chromate ion structure.",
        caption: "Chromate ion",
      },
      { src: "https://cdn.test/Chapter/extra.png", alt: "NCERT figure 3" },
    ]);
  });

  it("leaves content without figures untouched", () => {
    expect(splitCitationFigures("$$a+b$$", [])).toEqual({
      text: "$$a+b$$",
      figures: [],
    });
  });
});
