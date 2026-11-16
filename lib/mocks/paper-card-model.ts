import type { PaperAccessFields } from "@/types/access";
import type {
  ApiFullMockTest,
  ApiMockTest,
  ApiSprintTest,
  PaperListItemBase,
} from "@/types/mock-test";

/** One shape for chapter-wise, full mock and sprint cards. */
export type PaperCardData = PaperAccessFields & {
  id: string;
  title: string;
  subtitle: string | null;
  totalQuestions: number;
  durationInMinutes: number;
  marksPerQuestion: number;
  negativeMarking: number;
};

export const UNTITLED_PAPER = "Untitled paper";

function pickAccessFields(paper: PaperAccessFields): PaperAccessFields {
  return {
    ...(paper.accessMode ? { accessMode: paper.accessMode } : {}),
    ...(paper.access ? { access: paper.access } : {}),
    ...(paper.userAttemptAction
      ? { userAttemptAction: paper.userAttemptAction }
      : {}),
    ...(paper.resumeAttemptId
      ? { resumeAttemptId: paper.resumeAttemptId }
      : {}),
  };
}

function toCardData(
  paper: PaperListItemBase,
  title: string,
  subtitle: string | null
): PaperCardData {
  return {
    ...pickAccessFields(paper),
    id: paper.id,
    title,
    subtitle,
    totalQuestions: paper.totalQuestions,
    durationInMinutes: paper.durationInMinutes,
    marksPerQuestion: paper.marksPerQuestion,
    negativeMarking: paper.negativeMarking,
  };
}

/** Chapter Wise (TOPIC_WISE) card: "Subject · Chapter" is the subtitle. */
export function chapterPaperToCard(paper: ApiMockTest): PaperCardData {
  const title = paper.title || paper.topic?.name || paper.subject.name;
  const subtitle = [paper.subject.name, paper.topic?.name]
    .filter((part): part is string => Boolean(part))
    .join(" · ");
  return toCardData(paper, title, subtitle);
}

export function fullMockToCard(paper: ApiFullMockTest): PaperCardData {
  const title = paper.title || paper.exam?.name || UNTITLED_PAPER;
  return toCardData(
    paper,
    title,
    paper.isSessionWise ? "Session-wise" : "Full paper"
  );
}

export function sprintTestToCard(paper: ApiSprintTest): PaperCardData {
  const title = paper.title || paper.exam?.name || UNTITLED_PAPER;
  return toCardData(paper, title, "Sprint");
}
