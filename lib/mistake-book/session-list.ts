import type { PaperCardKind } from "@/lib/mocks/paper-card-model";
import type {
  MistakeBookSession,
  MistakePaperType,
} from "@/types/mistake-book";

/** Full NEET paper upper bound — dots wrap; card height may grow. */
export const MISTAKE_DOT_CAP = 180;

export type MistakeRecencySectionId =
  | "today"
  | "earlierThisWeek"
  | "older";

export type MistakeRecencyGroups = {
  today: MistakeBookSession[];
  earlierThisWeek: MistakeBookSession[];
  older: MistakeBookSession[];
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Monday 00:00 local for the week containing `date`. */
function startOfLocalWeek(date: Date): Date {
  const day = startOfLocalDay(date);
  const weekday = day.getDay(); // 0 Sun … 6 Sat
  const offset = weekday === 0 ? -6 : 1 - weekday;
  day.setDate(day.getDate() + offset);
  return day;
}

export function mistakePaperKind(paperType: MistakePaperType): PaperCardKind {
  switch (paperType) {
    case "TOPIC_WISE":
      return "chapter";
    case "FULL_EXAM":
      return "full";
    case "SPRINT":
      return "sprint";
  }
}

export function sessionBreadcrumb(
  session: Pick<MistakeBookSession, "subjectLabel" | "topicLabel">
): string {
  const subject = session.subjectLabel?.trim() ?? "";
  const topic = session.topicLabel?.trim() ?? "";
  if (subject && topic) return `${subject} · ${topic}`;
  return subject || topic;
}

export function mistakeDotCount(remainingCount: number): number {
  if (remainingCount <= 0) return 0;
  return Math.min(remainingCount, MISTAKE_DOT_CAP);
}

export function subjectSegmentPercent(
  count: number,
  totalMistakes: number
): number {
  if (totalMistakes <= 0 || count <= 0) return 0;
  return Math.round((count / totalMistakes) * 1000) / 10;
}

/**
 * Only the outer ends of the whole bar are pill-rounded.
 * Cuts between subjects stay square (with a gap between segments).
 */
export function subjectBarSegmentRadiusClass(
  index: number,
  segmentCount: number
): string {
  if (segmentCount <= 1) return "rounded-full";
  if (index === 0) return "rounded-l-full";
  if (index === segmentCount - 1) return "rounded-r-full";
  return "rounded-none";
}

export function groupSessionsByRecency(
  sessions: readonly MistakeBookSession[],
  now: Date = new Date()
): MistakeRecencyGroups {
  const todayStart = startOfLocalDay(now);
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const weekStart = startOfLocalWeek(now);

  const groups: MistakeRecencyGroups = {
    today: [],
    earlierThisWeek: [],
    older: [],
  };

  for (const session of sessions) {
    const submitted = new Date(session.attemptSubmittedAt);
    if (Number.isNaN(submitted.getTime())) {
      groups.older.push(session);
      continue;
    }
    if (submitted >= todayStart && submitted < tomorrowStart) {
      groups.today.push(session);
    } else if (submitted >= weekStart && submitted < todayStart) {
      groups.earlierThisWeek.push(session);
    } else {
      groups.older.push(session);
    }
  }

  return groups;
}

export function recencySectionLabel(
  id: MistakeRecencySectionId
): string {
  switch (id) {
    case "today":
      return "Today";
    case "earlierThisWeek":
      return "Earlier this week";
    case "older":
      return "Older";
  }
}
