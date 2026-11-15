import { StudyButton } from "@/components/study/study-button";
import type { EquationSubject, EquationSubjectId } from "@/types/equation-book";

type SubjectTabsProps = {
  subjects: readonly EquationSubject[];
  activeId: EquationSubjectId;
  onSelect: (id: EquationSubjectId) => void;
};

export function SubjectTabs({
  subjects,
  activeId,
  onSelect,
}: SubjectTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Subjects"
      className="grid w-full grid-cols-3 gap-2 sm:gap-3"
    >
      {subjects.map((subject) => {
        const active = subject.id === activeId;

        return (
          <StudyButton
            key={subject.id}
            role="tab"
            aria-selected={active}
            variant={active ? "ink" : "soft"}
            className="inline-flex h-[42px] w-full items-center justify-center rounded-[10px] px-2 text-[0.8125rem] font-medium sm:px-4"
            onClick={() => onSelect(subject.id)}
          >
            {subject.label}
          </StudyButton>
        );
      })}
    </div>
  );
}
