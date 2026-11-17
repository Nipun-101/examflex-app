import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MockTestResults } from "@/components/attempt/mock-test-results";
import { adaptAttemptDetailsToResults } from "@/lib/mocks/adapt-results";
import {
  makeDetails,
  makeMockTestData,
  makeQuestion,
  makeSession,
  makeSubmitResult,
} from "@/test-utils/attempt-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

function renderAdapted(
  detailsOverrides: Parameters<typeof makeDetails>[0] = {},
  props: Partial<Parameters<typeof MockTestResults>[0]> = {}
) {
  const adapted = adaptAttemptDetailsToResults(makeDetails(detailsOverrides));
  return render(
    <MockTestResults
      result={adapted.result}
      mockTestData={adapted.mockTestData}
      questions={adapted.questions}
      answerKeyAvailable={adapted.answerKeyAvailable}
      {...props}
    />
  );
}

describe("MockTestResults", () => {
  it("shows the score summary", () => {
    renderAdapted();
    expect(
      screen.getByRole("heading", { level: 1, name: "Test Completed" })
    ).toBeInTheDocument();
    // Ring uses correct / total questions to match the redesign.
    expect(
      screen.getByRole("img", { name: "Score 1 out of 3" })
    ).toBeInTheDocument();
    expect(screen.getByText("Kinematics practice")).toBeInTheDocument();
    expect(screen.getByText("50.0% accuracy")).toBeInTheDocument();
    expect(screen.getByText("15m 0s")).toBeInTheDocument();
    const summary = screen.getByRole("region", { name: "Score summary" });
    expect(within(summary).getByText("Correct")).toBeInTheDocument();
    expect(within(summary).getByText("Wrong")).toBeInTheDocument();
    expect(within(summary).getByText("Skipped")).toBeInTheDocument();
  });

  it("reports zero accuracy when nothing was attempted", () => {
    render(
      <MockTestResults
        result={makeSubmitResult({
          correctAnswers: 0,
          incorrectAnswers: 0,
          unansweredQuestions: 3,
          score: 0,
        })}
        mockTestData={makeMockTestData()}
        questions={[makeQuestion("q1")]}
        answerKeyAvailable={false}
      />
    );
    expect(screen.getByText("0% accuracy")).toBeInTheDocument();
  });

  it("renders the answer key, question map, and Chapter Wise exit links", () => {
    renderAdapted();
    expect(
      screen.getByRole("heading", { name: "Answer Key" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Question map" })
    ).toBeInTheDocument();
    expect(screen.getByText("Because physics")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Exam/ })).toHaveAttribute(
      "href",
      "/mocks/exam/exam1"
    );
    expect(screen.getByRole("link", { name: "Back to Mocks" })).toHaveAttribute(
      "href",
      "/mocks"
    );
    expect(
      screen.getByRole("link", { name: "More Chapter Wise" })
    ).toHaveAttribute("href", "/mocks/exam/exam1/chapter-wise");
  });

  it("filters the answer key by outcome", async () => {
    renderAdapted();
    const filter = screen.getByRole("group", {
      name: "Filter answer key by result",
    });
    expect(
      within(filter).getByRole("button", { name: "All 3" })
    ).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(
      within(filter).getByRole("button", { name: "Wrong 1" })
    );
    expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);
    expect(screen.getByText("Question 2")).toBeInTheDocument();

    await userEvent.click(
      within(filter).getByRole("button", { name: "Correct 1" })
    );
    expect(screen.getByText("Question 1")).toBeInTheDocument();
  });

  it("points sprint and full mock papers to their own lists", () => {
    const { unmount } = render(
      <MockTestResults
        result={makeSubmitResult()}
        mockTestData={makeMockTestData({ paperType: "SPRINT" })}
        questions={[]}
        answerKeyAvailable={false}
      />
    );
    expect(
      screen.getByRole("link", { name: "More Sprint Tests" })
    ).toHaveAttribute("href", "/mocks/exam/exam1/sprint-tests");
    unmount();
    render(
      <MockTestResults
        result={makeSubmitResult()}
        mockTestData={makeMockTestData({ paperType: "FULL_EXAM" })}
        questions={[]}
        answerKeyAvailable={false}
      />
    );
    expect(
      screen.getByRole("link", { name: "More Full Mocks" })
    ).toHaveAttribute("href", "/mocks/exam/exam1/full-mocks");
  });

  it("falls back to /mocks when the exam id is missing", () => {
    render(
      <MockTestResults
        result={makeSubmitResult()}
        mockTestData={makeMockTestData({
          exam: { id: "", name: "NEET", description: "" },
        })}
        questions={[]}
        answerKeyAvailable={false}
      />
    );
    expect(screen.getByRole("link", { name: /Back to Exam/ })).toHaveAttribute(
      "href",
      "/mocks"
    );
    expect(
      screen.getByRole("link", { name: "More Chapter Wise" })
    ).toHaveAttribute("href", "/mocks");
  });

  it("explains a hidden answer key", () => {
    renderAdapted({ questions: [makeQuestion("q1")] });
    expect(
      screen.getByText(/answer key for this paper isn't available/)
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Question map" })
    ).not.toBeInTheDocument();
  });

  it("toggles Malayalam copy", async () => {
    renderAdapted();
    await userEvent.click(screen.getByRole("radio", { name: "മലയാളം" }));
    expect(screen.getByText("ടെസ്റ്റ് പൂർത്തിയായി")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ഉത്തരക്കുറിപ്പ്" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /പരീക്ഷയിലേക്ക്/ })
    ).toBeInTheDocument();
  });

  it("starts in the language handed over from the runner", () => {
    renderAdapted({}, { initialLanguage: "ml" });
    expect(screen.getByText("ടെസ്റ്റ് പൂർത്തിയായി")).toBeInTheDocument();
  });

  it("hides the language toggle for single-language exams", () => {
    render(
      <MockTestResults
        result={makeSubmitResult()}
        mockTestData={makeMockTestData({
          exam: { id: "e", name: "NEET", description: "" },
        })}
        questions={[]}
        answerKeyAvailable={false}
      />
    );
    expect(
      screen.queryByRole("radiogroup", { name: "Language" })
    ).not.toBeInTheDocument();
  });

  describe("session-wise papers", () => {
    const sessionDetails = {
      isSessionWise: true,
      sessions: [
        makeSession(0, {
          name: "Physics",
          questionIds: ["q1", "q2"],
          timeConsumed: 600,
          status: "SUBMITTED",
        }),
        makeSession(1, {
          name: "Chemistry",
          questionIds: ["q3"],
          startIndex: 2,
          endIndex: 2,
          timeConsumed: 0,
          status: "SUBMITTED",
        }),
      ],
    } satisfies Parameters<typeof makeDetails>[0];

    it("shows section-wise scores and filters the answer key", async () => {
      renderAdapted(sessionDetails);
      expect(
        screen.getByRole("heading", { name: "Section-wise score" })
      ).toBeInTheDocument();
      expect(screen.getByText("10m 0s")).toBeInTheDocument();

      const filter = screen.getByRole("group", {
        name: "Filter answer key by section",
      });
      expect(
        within(filter).getByRole("button", { name: "All sections (3)" })
      ).toHaveAttribute("aria-pressed", "true");
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);

      await userEvent.click(
        within(filter).getByRole("button", { name: "Chemistry (1)" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);
      expect(screen.getByText("Question 3")).toBeInTheDocument();

      await userEvent.click(
        within(filter).getByRole("button", { name: "All sections (3)" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);
    });

    it("lets section cards drive the filter", async () => {
      renderAdapted(sessionDetails);
      const cards = screen.getAllByRole("button", { name: /Physics/ });
      const card = cards.find((button) => button.textContent?.includes("Correct"));
      expect(card).toBeDefined();
      await userEvent.click(card as HTMLElement);
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(2);
    });

    it("shows the whole key if the selected section disappears", async () => {
      const first = adaptAttemptDetailsToResults(makeDetails(sessionDetails));
      const { rerender } = render(
        <MockTestResults
          result={first.result}
          mockTestData={first.mockTestData}
          questions={first.questions}
          answerKeyAvailable
        />
      );
      await userEvent.click(
        screen.getByRole("button", { name: "Chemistry (1)" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);

      const next = adaptAttemptDetailsToResults(
        makeDetails({
          isSessionWise: true,
          sessions: [
            makeSession(0, {
              name: "Physics",
              questionIds: ["q1", "q2"],
              status: "SUBMITTED",
            }),
            makeSession(2, {
              name: "Biology",
              questionIds: ["q3"],
              startIndex: 2,
              endIndex: 2,
              status: "SUBMITTED",
            }),
          ],
        })
      );
      rerender(
        <MockTestResults
          result={next.result}
          mockTestData={next.mockTestData}
          questions={next.questions}
          answerKeyAvailable
        />
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);
    });

    it("does not show sections for a single session", () => {
      renderAdapted({
        isSessionWise: true,
        sessions: [
          makeSession(0, {
            questionIds: ["q1", "q2", "q3"],
            status: "SUBMITTED",
          }),
        ],
      });
      expect(screen.queryByText("Section-wise score")).not.toBeInTheDocument();
    });
  });
});
