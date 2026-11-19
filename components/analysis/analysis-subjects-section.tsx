import { StudyNavLink } from "@/components/study/study-nav-link";
import type { AnalysisSubjectsSection as SubjectsData } from "@/types/analysis";
import { examHubPath } from "@/lib/mocks/exam-test-routes";

type AnalysisSubjectsSectionProps = {
  examId: string;
  subjects: SubjectsData;
};

function strengthClass(label: "Strong" | "Good" | "Weak"): string {
  if (label === "Strong") return "bg-study-mint text-study-green";
  if (label === "Good") return "bg-study-lilac text-study-lilac-ink";
  return "bg-study-peach text-study-peach-ink";
}

const PLACEHOLDER_SUBJECTS = [
  { name: "Physics", width: "42%" },
  { name: "Chemistry", width: "58%" },
  { name: "Biology", width: "71%" },
] as const;

export function AnalysisSubjectsSection({
  examId,
  subjects,
}: AnalysisSubjectsSectionProps) {
  const empty = subjects.needsMoreAttempts || subjects.items.length === 0;
  const chapterHref =
    examId === "illustrative"
      ? "/mocks"
      : `${examHubPath(examId)}/chapter-wise`;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-study-ink lg:text-xl">
          Subject & chapter insights
        </h2>
        <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
          From chapter-wise attempts · weak chapters first
        </p>
      </div>

      {empty ? (
        <div className="relative min-h-[20rem] overflow-hidden rounded-[16px] border border-dashed border-study-divider bg-white sm:min-h-[22rem]">
          <div
            className="pointer-events-none absolute inset-0 grid gap-3 p-4 opacity-35 sm:grid-cols-3 sm:p-5"
            aria-hidden
          >
            {PLACEHOLDER_SUBJECTS.map((subject) => (
              <div
                key={subject.name}
                className="h-fit rounded-[12px] border border-study-divider px-3 py-3"
              >
                <p className="text-sm font-semibold text-study-ink">
                  {subject.name}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-study-mint">
                  <div
                    className="h-full rounded-full bg-study-green/60"
                    style={{ width: subject.width }}
                  />
                </div>
                <p className="mt-2 text-[0.625rem] text-study-muted-soft">
                  Chapter tips appear here
                </p>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex min-h-[20rem] items-center justify-center bg-white/55 px-5 py-8 backdrop-blur-[1.5px] sm:min-h-[22rem]">
            <div className="w-full max-w-md rounded-[16px] border border-study-divider/80 bg-white/90 px-5 py-5 text-center shadow-soft">
              <h3 className="font-display text-base font-semibold text-study-ink sm:text-lg">
                Unlock subject & chapter insights
              </h3>
              <p className="mt-2 text-sm leading-[1.45] text-study-muted-soft">
                Finish a few chapter-wise papers for this exam. We’ll surface
                strengths, weak chapters, and what to practice next.
              </p>
              <StudyNavLink
                href={chapterHref}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-[10px] bg-study-green px-5 text-sm font-semibold text-white transition-colors hover:bg-study-ink"
              >
                Open chapter wise
              </StudyNavLink>
            </div>
          </div>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {subjects.items.map((subject) => (
            <li
              key={subject.subjectId}
              className="rounded-[14px] bg-white px-4 py-4 shadow-soft"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-study-ink">
                  {subject.subjectName}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-1 text-[0.625rem] font-semibold ${strengthClass(subject.strengthLabel)}`}
                >
                  {subject.strengthLabel}
                </span>
              </div>
              <p className="mt-2 text-sm text-study-muted-soft">
                {Math.round(subject.averagePercent)}% avg ·{" "}
                {subject.attemptCount} chapter attempts
              </p>
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-study-mint"
                role="img"
                aria-label={`${subject.subjectName} ${Math.round(subject.averagePercent)} percent`}
              >
                <div
                  className="h-full rounded-full bg-study-green"
                  style={{
                    width: `${Math.min(100, Math.max(0, subject.averagePercent))}%`,
                  }}
                />
              </div>
              {subject.tip ? (
                <p className="mt-3 text-xs leading-[1.4] text-study-muted-soft">
                  {subject.tip}
                </p>
              ) : null}
              {subject.topics.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {subject.topics.slice(0, 3).map((topic) => (
                    <li
                      key={topic.topicId}
                      className="flex items-center justify-between gap-2 text-[0.6875rem]"
                    >
                      <span className="truncate text-study-ink">
                        {topic.topicName}
                      </span>
                      <span
                        className={
                          topic.isWeak
                            ? "font-semibold text-study-peach-ink"
                            : topic.isStrong
                              ? "font-semibold text-study-green"
                              : "text-study-muted-soft"
                        }
                      >
                        {Math.round(topic.averagePercent)}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
