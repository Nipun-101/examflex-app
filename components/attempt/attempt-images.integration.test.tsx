import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnswerKeyList } from "@/components/attempt/answer-key-list";
import { resetMathpixCache } from "@/components/attempt/mathpix-boundary";
import { QuestionPanel } from "@/components/attempt/question-panel";
import { parseAttemptDetails } from "@/lib/api/parse-attempt";
import { adaptAttemptDetailsToResults } from "@/lib/mocks/adapt-results";
import { DEFAULT_QUESTION_ZOOM_INDEX } from "@/lib/mocks/question-zoom";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

const S3 = "https://examflex-images.s3.ap-south-1.amazonaws.com/admin-images";
const signed = (name: string) =>
  `${S3}/${name}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=3600&X-Amz-Signature=abc123`;

/** Shape of `GET /mock-test-attempts/:id` (as captured from the running API). */
function apiPayload() {
  return {
    attemptId: "6b016dab45e6f95b92c88f00",
    status: "SUBMITTED",
    test: {
      title: "Motion in a straight line",
      durationInMinutes: 10,
      totalQuestions: 2,
      startedAt: "2026-11-21T10:10:08.246Z",
      marksPerQuestion: 4,
      negativeMarking: 1,
      passingScore: null,
      showResultsImmediately: true,
      paperType: "TOPIC_WISE",
      exam: {
        id: "6ac1335993fbfb809bc99def",
        name: "NEET UG",
        description: "d",
        hasMultiLingualSupport: false,
        performanceBands: [{ key: "good", minPercent: 40 }],
      },
      subject: { id: "6ac1326293fbfb809bc99dc9", name: "PHYSICS" },
      topic: { id: "6ac1361693fbfb809bc99e4a", name: "Motion in a Straight Line" },
    },
    questions: [
      {
        _id: "q-figure",
        questionText: {
          en: {
            text: "A particle shows distance-time curve as given in this figure.",
            imageUrl: signed("figure.png"),
          },
          ml: { text: null, imageUrl: null },
        },
        optionType: "image",
        options: [
          { id: "a", type: "image", en: null, ml: null, imageUrl: signed("opt-a.png") },
          { id: "b", type: "image", en: null, ml: null, imageUrl: signed("opt-b.png") },
        ],
        subject: "6ac1326293fbfb809bc99dc9",
        topic: "6ac1361693fbfb809bc99e4a",
        difficultyLevel: "easy",
        selectedOption: "b",
        correctAnswer: "a",
        isCorrect: false,
        marksAwarded: -1,
        explanation: { en: "See the slope.", ml: null, imageUrl: signed("why.png"), imageUrls: [] },
      },
      {
        _id: "q-text",
        questionText: {
          en: { text: "The ratio of distance traversed is", imageUrl: null },
          ml: { text: null, imageUrl: null },
        },
        optionType: "text",
        options: [
          { id: "a", type: "text", en: "1 : 2 : 3", ml: null, imageUrl: null },
          { id: "b", type: "text", en: "1 : 3 : 5", ml: null, imageUrl: null },
        ],
        subject: "6ac1326293fbfb809bc99dc9",
        topic: "6ac1361693fbfb809bc99e4a",
        difficultyLevel: "easy",
        selectedOption: "b",
        correctAnswer: "b",
        isCorrect: true,
        marksAwarded: 4,
      },
    ],
    isSessionWise: false,
    score: 3,
    totalScore: 8,
    submittedAt: "2026-11-21T10:15:00.000Z",
    timeTaken: 290,
    correctAnswers: 1,
    incorrectAnswers: 1,
    unansweredQuestions: 0,
  };
}

beforeEach(() => {
  resetMathpixCache();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("images from the API payload to the screen", () => {
  it("parses signed URLs for the stem and every option without altering them", () => {
    const details = parseAttemptDetails(apiPayload())!;
    const [figure, plain] = details.questions;
    expect(figure!.questionText.en.imageUrl).toBe(signed("figure.png"));
    expect(figure!.options.map((o) => o.imageUrl)).toEqual([
      signed("opt-a.png"),
      signed("opt-b.png"),
    ]);
    expect(plain!.questionText.en.imageUrl).toBeNull();
  });

  it("shows the question picture and option pictures in the attempt runner", () => {
    const details = parseAttemptDetails(apiPayload())!;
    render(
      <QuestionPanel
        question={details.questions[0]!}
        number={1}
        language="en"
        zoomIndex={DEFAULT_QUESTION_ZOOM_INDEX}
        selectedOptionId={undefined}
        onSelectOption={vi.fn()}
      />
    );
    expect(screen.getByRole("img", { name: "Question" })).toHaveAttribute(
      "src",
      signed("figure.png")
    );
    expect(screen.getByRole("img", { name: "Option a" })).toHaveAttribute(
      "src",
      signed("opt-a.png")
    );
    expect(screen.getByRole("img", { name: "Option b" })).toHaveAttribute(
      "src",
      signed("opt-b.png")
    );
  });

  it("renders no pictures for a text-only question", () => {
    const details = parseAttemptDetails(apiPayload())!;
    render(
      <QuestionPanel
        question={details.questions[1]!}
        number={2}
        language="en"
        zoomIndex={DEFAULT_QUESTION_ZOOM_INDEX}
        selectedOptionId={undefined}
        onSelectOption={vi.fn()}
      />
    );
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("shows the question, option and explanation pictures in the results", () => {
    const adapted = adaptAttemptDetailsToResults(parseAttemptDetails(apiPayload())!);
    render(
      <AnswerKeyList
        questions={adapted.questions}
        resultsByQuestion={
          new Map(adapted.result.questionResults!.map((r) => [r.questionId, r]))
        }
        paperIndexById={new Map(adapted.questions.map((q, i) => [q._id, i]))}
        sectionByQuestionId={new Map()}
        showSectionHeadings={false}
        language="en"
      />
    );

    // the wrong answer opens expanded: stem + options + explanation pictures
    expect(screen.getByRole("img", { name: "Question" })).toHaveAttribute(
      "src",
      signed("figure.png")
    );
    expect(screen.getAllByRole("img", { name: "Option" }).map((img) => img.getAttribute("src"))).toEqual([
      signed("opt-a.png"),
      signed("opt-b.png"),
    ]);
    expect(screen.getByRole("img", { name: "Explanation" })).toHaveAttribute(
      "src",
      signed("why.png")
    );
  });
});
