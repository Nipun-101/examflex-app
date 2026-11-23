import type { MistakeCitation, MistakeItem } from "@/types/mistake-book";

/** The NCERT citation to show, or null when the card should stay hidden. */
export function visibleCitation(mistake: MistakeItem): MistakeCitation | null {
  const citation = mistake.citation;
  if (mistake.citationStatus !== "done" || !citation) return null;
  if (!citation.title.trim() || !citation.content.trim()) return null;
  return citation;
}

export type CitationFigure = {
  src: string;
  alt: string;
  caption?: string;
};

export type CitationBody = {
  /** Content with every `<figure>` block removed. */
  text: string;
  figures: CitationFigure[];
};

const FIGURE_BLOCK = /<figure>([\s\S]*?)<\/figure>/gi;

function innerTag(block: string, tag: string): string | undefined {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  const value = match?.[1]?.trim();
  return value ? value : undefined;
}

/** `https://cdn/…/figure-7.jpg?x=1` → `figure-7`. */
function imageName(url: string): string {
  const path = url.split(/[?#]/)[0] ?? "";
  const file = path.slice(path.lastIndexOf("/") + 1);
  const dot = file.lastIndexOf(".");
  return (dot > 0 ? file.slice(0, dot) : file).toLowerCase();
}

/**
 * Splits NCERT chunk content into text and pictures. Figure blocks look like
 * `<figure>figure-7<caption>…</caption><description>…</description></figure>`;
 * they are removed from the text and their caption is matched to the image
 * whose file name is the figure label (`…/figure-7.jpg`).
 */
export function splitCitationFigures(
  content: string,
  images: readonly string[]
): CitationBody {
  const meta = new Map<string, { caption?: string; description?: string }>();

  const text = content
    .replace(FIGURE_BLOCK, (_block, inner: string) => {
      const label = inner.replace(/<(caption|description)>[\s\S]*$/i, "").trim();
      if (label) {
        const caption = innerTag(inner, "caption");
        const description = innerTag(inner, "description");
        meta.set(label.toLowerCase(), {
          ...(caption ? { caption } : {}),
          ...(description ? { description } : {}),
        });
      }
      return "\n\n";
    })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const figures = images.map((src, index): CitationFigure => {
    const info = meta.get(imageName(src));
    // The caption is already visible, so the description says more as alt text.
    const alt =
      info?.description ?? info?.caption ?? `NCERT figure ${index + 1}`;
    return info?.caption ? { src, alt, caption: info.caption } : { src, alt };
  });

  return { text, figures };
}
