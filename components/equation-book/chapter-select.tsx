export type EquationChapterOption = {
  id: string;
  label: string;
};

type ChapterSelectProps = {
  chapters: readonly EquationChapterOption[];
  value: string;
  onChange: (chapterId: string) => void;
};

export function ChapterSelect({
  chapters,
  value,
  onChange,
}: ChapterSelectProps) {
  return (
    <div className="relative w-full">
      <select
        aria-label="Chapter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[46px] w-full cursor-pointer appearance-none rounded-[10px] border border-study-divider bg-white px-4 pr-10 text-center text-[0.8125rem] font-medium text-study-ink transition-colors hover:bg-study-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink"
      >
        {chapters.map((chapter) => (
          <option key={chapter.id} value={chapter.id}>
            {`Chapter: ${chapter.label}`}
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
  );
}
