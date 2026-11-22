import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MockTestResults } from "@/components/attempt/mock-test-results";
import { adaptAttemptDetailsToResults } from "@/lib/mocks/adapt-results";
import {
  makeDetails,
  makeDetailsQuestion,
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
    // Ring shows marks earned / total marks, not question counts.
    expect(
      screen.getByRole("img", { name: "Score 3 out of 12" })
    ).toBeInTheDocument();
    expect(screen.getByText("Kinematics practice")).toBeInTheDocument();
    expect(screen.getByText("50.0% accuracy")).toBeInTheDocument();
    expect(screen.getByText("15m 0s")).toBeInTheDocument();
    const summary = screen.getByRole("region", { name: "Score summary" });
    expect(within(summary).getByText("Correct")).toBeInTheDocument();
    expect(within(summary).getByText("Wrong")).toBeInTheDocument();
    expect(within(summary).getByText("Skipped")).toBeInTheDocument();
  });

  it("links the summary card to the analysis page", () => {
    renderAdapted();
    const summary = screen.getByRole("region", { name: "Score summary" });
    expect(
      within(summary).getByRole("link", { name: /See your full analysis/ })
    ).toHaveAttribute("href", "/analysis");
  });

  describe("Mistake Book shortcut", () => {
    function details(
      overrides: { mockTestId?: string } = {},
      counts?: { correct: number; wrong: number; skipped: number }
    ) {
      const base = makeDetails();
      return {
        test: { ...base.test, ...overrides },
        ...(counts
          ? {
              correctAnswers: counts.correct,
              incorrectAnswers: counts.wrong,
              unansweredQuestions: counts.skipped,
            }
          : {}),
      };
    }

    it("links to this paper's Mistake Book with the wrong + skipped count", () => {
      // fixture: 1 correct, 1 wrong, 1 skipped
      renderAdapted(details({ mockTestId: "mock-77" }));
      const cta = screen.getByRole("complementary", { name: "Mistake Book" });
      expect(within(cta).getByText("2 questions saved from this test")).toBeInTheDocument();
      expect(
        within(cta).getByRole("link", { name: "Review mistakes" })
      ).toHaveAttribute("href", "/mistake-book/mock-77");
    });

    it("sits right under the score summary, above the question map", () => {
      renderAdapted(details({ mockTestId: "mock-77" }));
      const summary = screen.getByRole("region", { name: "Score summary" });
      const cta = screen.getByRole("complementary", { name: "Mistake Book" });
      const map = screen.getByRole("heading", { name: "Question map" });
      expect(
        summary.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      expect(
        cta.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
      // same column as the summary, so it follows it on every breakpoint
      expect(cta.parentElement).toBe(summary.parentElement);
    });

    it("is hidden when the API did not say which paper this was", () => {
      renderAdapted(details());
      expect(
        screen.queryByRole("complementary", { name: "Mistake Book" })
      ).not.toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Review mistakes" })).not.toBeInTheDocument();
    });

    it("congratulates instead of linking when nothing needs reviewing", () => {
      renderAdapted(
        details({ mockTestId: "mock-77" }, { correct: 3, wrong: 0, skipped: 0 })
      );
      expect(screen.getByText("Clean sheet.")).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: "Review mistakes" })).not.toBeInTheDocument();
    });
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

    function filterRows() {
      return {
        status: screen.getByRole("group", {
          name: "Filter answer key by result",
        }),
        subjects: screen.getByRole("group", {
          name: "Filter answer key by subject",
        }),
      };
    }

    it("groups the map by subject with per-subject counts", () => {
      renderAdapted(sessionDetails);
      expect(
        screen.getByRole("heading", { name: "Physics · 1–2" })
      ).toBeInTheDocument();
      expect(
        screen.getByText("1 correct · 1 wrong · 0 skipped")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: "Section-wise score" })
      ).not.toBeInTheDocument();
    });

    it("selects one subject at a time and clears it on a second tap", async () => {
      renderAdapted(sessionDetails);
      const { subjects } = filterRows();
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);

      await userEvent.click(
        within(subjects).getByRole("button", { name: "Chemistry" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);
      expect(screen.getByText("Question 3")).toBeInTheDocument();

      await userEvent.click(
        within(subjects).getByRole("button", { name: "Physics" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(2);
      expect(
        within(subjects).getByRole("button", { name: "Chemistry" })
      ).toHaveAttribute("aria-pressed", "false");

      await userEvent.click(
        within(subjects).getByRole("button", { name: "Physics" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);
    });

    it("combines the result row with the subject row", async () => {
      renderAdapted(sessionDetails);
      const { status, subjects } = filterRows();

      await userEvent.click(
        within(subjects).getByRole("button", { name: "Physics" })
      );
      await userEvent.click(
        within(status).getByRole("button", { name: "Wrong 1" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);
      expect(screen.getByText("Question 2")).toBeInTheDocument();
      expect(screen.getByText("Showing 1 of 3")).toBeInTheDocument();

      // Skipped lives in Chemistry only: Physics + Skipped is empty.
      await userEvent.click(
        within(status).getByRole("button", { name: "Skipped 1" })
      );
      expect(
        screen.getAllByText("No questions match these filters.").length
      ).toBeGreaterThan(0);

      await userEvent.click(
        screen.getAllByRole("button", { name: "Clear filters" })[0] as HTMLElement
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);
      expect(within(status).getByRole("button", { name: "All 3" })).toHaveAttribute(
        "aria-pressed",
        "true"
      );
    });

    it("shows the whole key if the selected subject disappears", async () => {
      const first = adaptAttemptDetailsToResults(makeDetails(sessionDetails));
      const { rerender } = render(
        <MockTestResults
          result={first.result}
          mockTestData={first.mockTestData}
          questions={first.questions}
          answerKeyAvailable
        />
      );
      await userEvent.click(screen.getByRole("button", { name: "Chemistry" }));
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

    it("does not show subjects for a single session", () => {
      renderAdapted({
        isSessionWise: true,
        sessions: [
          makeSession(0, {
            questionIds: ["q1", "q2", "q3"],
            status: "SUBMITTED",
          }),
        ],
      });
      expect(
        screen.queryByRole("group", { name: "Filter answer key by subject" })
      ).not.toBeInTheDocument();
    });
  });

  describe("papers without sessions", () => {
    it("builds the subject chips from each question's subject", async () => {
      renderAdapted({
        questions: [
          makeDetailsQuestion("q1", { subject: "id-Physics", subjectName: "Physics", correctAnswer: "q1-a" }),
          makeDetailsQuestion("q2", { subject: "id-Physics", subjectName: "Physics", correctAnswer: "q2-a" }),
          makeDetailsQuestion("q3", { subject: "id-Chemistry", subjectName: "Chemistry", correctAnswer: "q3-a" }),
        ],
      });
      const subjects = screen.getByRole("group", {
        name: "Filter answer key by subject",
      });
      expect(
        within(subjects)
          .getAllByRole("button")
          .map((button) => button.textContent)
      ).toEqual(["Physics", "Chemistry"]);

      await userEvent.click(
        within(subjects).getByRole("button", { name: "Chemistry" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);
      await userEvent.click(
        within(subjects).getByRole("button", { name: "Chemistry" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(3);
    });

    it("never shows raw subject ids when names are missing", () => {
      renderAdapted({
        questions: [
          makeDetailsQuestion("q1", { subject: "id-1", correctAnswer: "q1-a" }),
          makeDetailsQuestion("q2", { subject: "id-2", correctAnswer: "q2-a" }),
        ],
      });
      expect(
        screen.queryByRole("group", { name: "Filter answer key by subject" })
      ).not.toBeInTheDocument();
    });

    it("shows no subject strip for a single-subject chapter test", () => {
      renderAdapted({
        questions: [
          makeDetailsQuestion("q1", { subject: "id-Physics", subjectName: "Physics", correctAnswer: "q1-a" }),
          makeDetailsQuestion("q2", { subject: "id-Physics", subjectName: "Physics", correctAnswer: "q2-a" }),
          makeDetailsQuestion("q3", { subject: "id-Physics", subjectName: "Physics", correctAnswer: "q3-a" }),
        ],
      });
      expect(
        screen.queryByRole("group", { name: "Filter answer key by subject" })
      ).not.toBeInTheDocument();
    });
  });

  describe("phone question map", () => {
    it("opens a sheet with the map, filters and Mistake Book button, and closes on Escape", async () => {
      renderAdapted({
        test: { ...makeDetails().test, mockTestId: "mock-77" },
      });
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      const pill = screen.getByRole("button", { name: /Question map/ });
      expect(pill).toHaveTextContent("Q1 / 3");
      await userEvent.click(pill);

      const sheet = screen.getByRole("dialog", { name: "Question map" });
      expect(
        within(sheet).getByRole("button", { name: "Wrong 1" })
      ).toBeInTheDocument();
      expect(
        within(sheet).getByRole("link", { name: /Review mistakes · 2/ })
      ).toHaveAttribute("href", "/mistake-book/mock-77");
      expect(within(sheet).getByText("You are here")).toBeInTheDocument();

      await userEvent.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("filters from the sheet and closes after jumping to a question", async () => {
      const scrollIntoView = vi.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoView;
      renderAdapted();
      await userEvent.click(screen.getByRole("button", { name: /Question map/ }));
      const sheet = screen.getByRole("dialog", { name: "Question map" });

      await userEvent.click(
        within(sheet).getByRole("button", { name: "Wrong 1" })
      );
      expect(screen.getAllByText(/^Question \d$/)).toHaveLength(1);

      await userEvent.click(
        within(sheet).getByRole("button", { name: "Question 2, wrong" })
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(scrollIntoView).toHaveBeenCalled();
    });

    it("pins a compact summary once the result card scrolls away", () => {
      let notify: IntersectionObserverCallback = () => {};
      class FakeObserver {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
        takeRecords() {
          return [];
        }
      }
      vi.stubGlobal("IntersectionObserver", FakeObserver);
      try {
        renderAdapted();
        expect(
          screen.queryByRole("region", { name: "Score summary bar" })
        ).not.toBeInTheDocument();

        act(() => {
          notify(
            [
              {
                isIntersecting: false,
                boundingClientRect: { bottom: -40 },
              } as IntersectionObserverEntry,
            ],
            {} as IntersectionObserver
          );
        });
        const bar = screen.getByRole("region", { name: "Score summary bar" });
        expect(within(bar).getByText("Test Completed")).toBeInTheDocument();

        act(() => {
          notify(
            [
              {
                isIntersecting: true,
                boundingClientRect: { bottom: 120 },
              } as IntersectionObserverEntry,
            ],
            {} as IntersectionObserver
          );
        });
        expect(
          screen.queryByRole("region", { name: "Score summary bar" })
        ).not.toBeInTheDocument();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("has no map pill when the answer key is hidden", () => {
      renderAdapted({ questions: [makeQuestion("q1")] });
      expect(
        screen.queryByRole("button", { name: /Question map/ })
      ).not.toBeInTheDocument();
    });
  });
});
