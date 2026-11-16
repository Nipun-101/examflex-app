"use client";

import type { ApiSubjectForExam } from "@/types/exam";

type ChapterWiseFiltersProps = {
  subjects: readonly ApiSubjectForExam[];
  subjectId: string;
  topicId: string;
  onSubjectChange: (subjectId: string) => void;
  onTopicChange: (topicId: string) => void;
};

const selectClassName =
  "h-11 w-full cursor-pointer appearance-none rounded-[10px] border border-study-divider bg-white px-4 pr-10 text-sm font-medium text-study-ink transition-colors hover:bg-study-mint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-ink disabled:cursor-not-allowed disabled:opacity-50";

/** Subject → topic (chapter) filters for chapter-wise papers. */
export function ChapterWiseFilters({
  subjects,
  subjectId,
  topicId,
  onSubjectChange,
  onTopicChange,
}: ChapterWiseFiltersProps) {
  const selected = subjects.find((subject) => subject.id === subjectId);
  const topics = selected?.topics ?? [];
  const topicEnabled = Boolean(subjectId);

  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="relative">
        <label className="sr-only" htmlFor="chapter-wise-subject">
          Subject
        </label>
        <select
          id="chapter-wise-subject"
          aria-label="Subject"
          value={subjectId}
          onChange={(event) => onSubjectChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="chapter-wise-topic">
          Chapter
        </label>
        <select
          id="chapter-wise-topic"
          aria-label="Chapter"
          value={topicId}
          disabled={!topicEnabled}
          onChange={(event) => onTopicChange(event.target.value)}
          className={selectClassName}
        >
          <option value="">
            {topicEnabled ? "All chapters" : "Select a subject first"}
          </option>
          {topics.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.name}
            </option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}

function SelectChevron() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-study-ink"
    >
      ▾
    </span>
  );
}
