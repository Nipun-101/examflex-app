import type {
  MistakeChapterOption,
  MistakeSubjectId,
  MistakeSubjectOption,
} from "@/types/mistake-book";

type MistakeFiltersProps = {
  subjects: readonly MistakeSubjectOption[];
  chapters: readonly MistakeChapterOption[];
  subjectId: MistakeSubjectId;
  chapterId: string;
  onSubjectChange: (subjectId: MistakeSubjectId) => void;
  onChapterChange: (chapterId: string) => void;
};

const selectClassName =
  "h-[44px] w-full cursor-pointer appearance-none rounded-[10px] border border-study-divider bg-white px-4 pr-10 text-center text-[0.8125rem] font-medium text-study-ink transition-colors hover:bg-study-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink";

export function MistakeFilters({
  subjects,
  chapters,
  subjectId,
  chapterId,
  onSubjectChange,
  onChapterChange,
}: MistakeFiltersProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <div className="relative">
        <label className="sr-only" htmlFor="mistake-subject-filter">
          Subject
        </label>
        <select
          id="mistake-subject-filter"
          aria-label="Subject"
          value={subjectId}
          onChange={(event) =>
            onSubjectChange(event.target.value as MistakeSubjectId)
          }
          className={selectClassName}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-study-ink"
        >
          ▾
        </span>
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="mistake-chapter-filter">
          Chapter
        </label>
        <select
          id="mistake-chapter-filter"
          aria-label="Chapter"
          value={chapterId}
          onChange={(event) => onChapterChange(event.target.value)}
          className={selectClassName}
        >
          <option value="all">All chapters</option>
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-study-ink"
        >
          ▾
        </span>
      </div>
    </div>
  );
}
