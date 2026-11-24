import type { MistakeCitation } from "@/types/mistake-book";

type MistakeNcertChipsProps = {
  citation: MistakeCitation;
  className?: string;
};

const CHIP =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-tight";

/** Chapter, class and page chips; each is left out when its field is missing. */
export function MistakeNcertChips({
  citation,
  className = "",
}: MistakeNcertChipsProps) {
  const chapter = citation.chapterName?.trim();
  const grade = citation.grade?.trim();
  const page = citation.pageNumber;
  if (!chapter && !grade && page === undefined) return null;

  return (
    <ul className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {chapter ? (
        <li className={`${CHIP} bg-study-butter text-[#5b4a12]`}>{chapter}</li>
      ) : null}
      {grade ? (
        <li className={`${CHIP} bg-study-lilac text-study-lilac-ink`}>
          Class {grade}
        </li>
      ) : null}
      {page !== undefined ? (
        <li
          className={`${CHIP} border border-study-divider bg-white text-study-muted-soft`}
        >
          Page {page}
        </li>
      ) : null}
    </ul>
  );
}
