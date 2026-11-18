import { StudyButton } from "@/components/study/study-button";

export type EquationSubjectOption = {
  id: string;
  label: string;
};

type SubjectTabsProps = {
  subjects: readonly EquationSubjectOption[];
  activeId: string;
  onSelect: (id: string) => void;
  /** `grid` fills equal columns; `wrap` keeps compact chips that flow onto new lines. */
  layout?: "grid" | "wrap";
};

export function SubjectTabs({
  subjects,
  activeId,
  onSelect,
  layout = "grid",
}: SubjectTabsProps) {
  const isWrap = layout === "wrap";

  return (
    <div
      role="tablist"
      aria-label="Subjects"
      className={
        isWrap
          ? "flex flex-wrap gap-2.5"
          : "grid w-full grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4"
      }
    >
      {subjects.map((subject) => {
        const active = subject.id === activeId;

        return (
          <StudyButton
            key={subject.id || "all"}
            role="tab"
            aria-selected={active}
            variant={active ? "ink" : "soft"}
            className={
              isWrap
                ? "inline-flex h-[46px] min-w-0 flex-1 basis-[calc(50%-0.3125rem)] items-center justify-center rounded-[10px] px-3 text-[0.875rem] font-medium sm:flex-none sm:basis-auto sm:px-5"
                : "inline-flex h-[42px] w-full items-center justify-center rounded-[10px] px-2 text-[0.8125rem] font-medium sm:px-4"
            }
            onClick={() => onSelect(subject.id)}
          >
            {subject.label}
          </StudyButton>
        );
      })}
    </div>
  );
}
