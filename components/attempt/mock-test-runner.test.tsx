import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MockTestRunner } from "@/components/attempt/mock-test-runner";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import {
  completeSession,
  patchAttemptAnswer,
  pauseAttempt,
  pauseAttemptKeepalive,
  resumeAttempt,
  submitAttempt,
} from "@/lib/api/attempts";
import { cacheAttempt, readCachedAttempt } from "@/lib/mocks/attempt-storage";
import {
  makeMockTestData,
  makeQuestion,
  makeResumeData,
  makeSession,
  makeStartData,
  makeSubmitResult,
} from "@/test-utils/attempt-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";
import type { ApiResult } from "@/lib/api/client";
import type {
  AttemptMockTestData,
  AttemptQuestion,
  CompleteSessionResult,
  PauseAttemptData,
} from "@/types/attempt";

const push = vi.fn();
const router = { push, replace: vi.fn() };

vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/mocks/attempt/a1",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("mathpix-markdown-it", () => mathpixModuleStub());
vi.mock("@/lib/api/attempts", () => ({
  completeSession: vi.fn(),
  patchAttemptAnswer: vi.fn(),
  pauseAttempt: vi.fn(),
  pauseAttemptKeepalive: vi.fn(),
  resumeAttempt: vi.fn(),
  submitAttempt: vi.fn(),
}));

const patchMock = vi.mocked(patchAttemptAnswer);
const pauseMock = vi.mocked(pauseAttempt);
const resumeMock = vi.mocked(resumeAttempt);
const submitMock = vi.mocked(submitAttempt);
const completeMock = vi.mocked(completeSession);

const ok = <T,>(data: T): ApiResult<T> => ({ ok: true, data });
const fail = (message: string): ApiResult<never> => ({
  ok: false,
  message,
  status: 500,
});

const PAUSED: PauseAttemptData = {
  attemptId: "att1",
  testTitle: "Kinematics practice",
  status: "PAUSED",
  timeConsumed: 600,
  timeRemaining: 3000,
};

type SetupOptions = {
  mockTestData?: AttemptMockTestData;
  questions?: AttemptQuestion[];
  initialSecondsLeft?: number;
  initialPaused?: boolean;
};

function setup(options: SetupOptions = {}) {
  const onFinished = vi.fn();
  const user = userEvent.setup();
  const view = render(
    <StudyLoadingProvider>
      <MockTestRunner
        attemptId="att1"
        mockTestData={options.mockTestData ?? makeMockTestData()}
        questions={options.questions ?? makeStartData().questions}
        initialSecondsLeft={options.initialSecondsLeft ?? 3600}
        {...(options.initialPaused ? { initialPaused: true } : {})}
        onFinished={onFinished}
      />
    </StudyLoadingProvider>,
  );
  return { user, onFinished, ...view };
}

/** Desktop and mobile controls are both in the DOM; they behave identically. */
const first = (name: string | RegExp) =>
  screen.getAllByRole("button", { name })[0] as HTMLElement;

function sessionSetup(
  overrides: Partial<AttemptMockTestData> = {},
  extra: Pick<SetupOptions, "initialPaused" | "initialSecondsLeft"> = {},
) {
  return setup({
    ...extra,
    mockTestData: makeMockTestData({
      isSessionWise: true,
      currentSessionIndex: 0,
      sessions: [makeSession(0), makeSession(1)],
      ...overrides,
    }),
    questions: [
      makeQuestion("q1"),
      makeQuestion("q2"),
      makeQuestion("q3"),
      makeQuestion("q4"),
    ],
  });
}

function sessionResume(index: number) {
  return makeResumeData({
    questions: [
      makeQuestion("q1"),
      makeQuestion("q2"),
      makeQuestion("q3"),
      makeQuestion("q4"),
    ],
    mockTestData: makeMockTestData({
      isSessionWise: true,
      currentSessionIndex: index,
      sessions: [
        makeSession(0, { status: index > 0 ? "COMPLETED" : "IN_PROGRESS" }),
        makeSession(1, { status: index > 0 ? "IN_PROGRESS" : "LOCKED" }),
      ],
    }),
    timeRemaining: 1700,
  });
}

async function openSubmit(
  user: ReturnType<typeof userEvent.setup>,
  label = "Submit Test",
) {
  await user.click(first(/Question 3, not visited/i));
  await user.click(first(label));
  return screen.getByRole("dialog");
}

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  patchMock.mockResolvedValue(ok(undefined as never));
});

describe("MockTestRunner answering", () => {
  it("selects an answer optimistically and saves it", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    await waitFor(() =>
      expect(screen.getByRole("radio", { name: "A of q1" })).toBeChecked(),
    );
    expect(patchMock).toHaveBeenCalledWith("att1", "q1", "q1-a");
    expect(first(/Question 1, answered$/i)).toBeInTheDocument();
  });

  it("clears the answer when the selected option is tapped again", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    expect(screen.getByRole("radio", { name: "A of q1" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    expect(screen.getByRole("radio", { name: "A of q1" })).not.toBeChecked();
    expect(patchMock).toHaveBeenLastCalledWith("att1", "q1", null);
  });

  it("clears with the Clear button, and ignores it when nothing is selected", async () => {
    const { user } = setup();
    await user.click(first(/Clear/));
    expect(patchMock).not.toHaveBeenCalled();
    await user.click(screen.getByRole("radio", { name: "B of q1" }));
    await user.click(first(/Clear/));
    expect(screen.getByRole("radio", { name: "B of q1" })).not.toBeChecked();
    expect(patchMock).toHaveBeenLastCalledWith("att1", "q1", null);
  });

  it("keeps the answer and shows a dismissible notice when saving fails", async () => {
    patchMock.mockResolvedValue(fail("nope"));
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      /couldn't sync/i,
    );
    expect(screen.getByRole("radio", { name: "A of q1" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("restores answers the server already holds", () => {
    setup({
      questions: [
        makeQuestion("q1", { selectedOption: "q1-b" }),
        makeQuestion("q2"),
      ],
    });
    expect(screen.getByRole("radio", { name: "B of q1" })).toBeChecked();
  });
});

describe("MockTestRunner navigation", () => {
  it("moves with Save & Next, Previous and the palette", async () => {
    const { user } = setup();
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
    await user.click(first("Save & Next"));
    expect(
      screen.getByRole("heading", { name: "Question No 2" }),
    ).toBeInTheDocument();
    await user.click(first(/Prev/));
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
    await user.click(first(/Question 3, not visited/i));
    expect(
      screen.getByRole("heading", { name: "Question No 3" }),
    ).toBeInTheDocument();
  });

  it("marks for review and moves on", async () => {
    const { user } = setup();
    await user.click(first(/Mark/));
    expect(
      screen.getByRole("heading", { name: "Question No 2" }),
    ).toBeInTheDocument();
    expect(first(/Question 1, marked for review/i)).toBeInTheDocument();
  });

  it("does not run past the last question when marking", async () => {
    const { user } = setup({ questions: [makeQuestion("q1")] });
    await user.click(first(/Mark/));
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
  });

  it("goes back with the mobile Prev button", async () => {
    const { user } = setup();
    await user.click(first("Save & Next"));
    await user.click(screen.getByRole("button", { name: "Prev" }));
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
  });

  it("closes the mobile palette sheet with Escape", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Open question palette" }),
    );
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens and closes the mobile palette sheet", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Open question palette" }),
    );
    const sheet = screen.getByRole("dialog", { name: "Questions" });
    await user.click(
      within(sheet).getByRole("button", { name: /Question 2, not visited/i }),
    );
    expect(
      screen.getByRole("heading", { name: "Question No 2" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Open question palette" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Close question palette" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("submits from the mobile palette sheet", async () => {
    const { user } = setup();
    await user.click(
      screen.getByRole("button", { name: "Open question palette" }),
    );
    const sheet = screen.getByRole("dialog", { name: "Questions" });
    await user.click(
      within(sheet).getByRole("button", { name: "Submit Test" }),
    );
    expect(
      screen.getByRole("dialog", { name: "Submit Test?" }),
    ).toBeInTheDocument();
  });
});

describe("MockTestRunner display", () => {
  it("zooms only within the allowed steps", async () => {
    const { user } = setup();
    const zoomed = () =>
      screen
        .getByTestId("question-zoom")
        .style.getPropertyValue("--question-zoom");
    await user.click(screen.getByRole("button", { name: "Zoom in question" }));
    expect(zoomed()).toBe("1.1");
    for (let i = 0; i < 10; i += 1) {
      await user.click(
        screen.getByRole("button", { name: "Zoom in question" }),
      );
    }
    expect(zoomed()).toBe("1.6");
    for (let i = 0; i < 10; i += 1) {
      await user.click(
        screen.getByRole("button", { name: "Zoom out question" }),
      );
    }
    expect(zoomed()).toBe("0.8");
  });

  it("switches the question to Malayalam", async () => {
    const { user } = setup();
    expect(screen.getByRole("radio", { name: "A of q1" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "മലയാളം" }));
    expect(screen.getByRole("radio", { name: "എ q1" })).toBeInTheDocument();
  });

  it("hides the language toggle for single-language exams", () => {
    setup({
      mockTestData: makeMockTestData({
        exam: {
          id: "exam1",
          name: "NEET",
          description: "",
          hasMultiLingualSupport: false,
        },
      }),
    });
    expect(
      screen.queryByRole("radiogroup", { name: "Language" }),
    ).not.toBeInTheDocument();
  });

  it("explains an empty paper and links back to the list", () => {
    setup({ questions: [] });
    expect(
      screen.getByRole("heading", { name: "No questions to show" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/mocks/exam/exam1/chapter-wise",
    );
  });

  it("shows the active section chip on session-wise papers", () => {
    sessionSetup();
    expect(screen.getAllByText("Section 1").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Question 3,/ }),
    ).not.toBeInTheDocument();
  });

  it("names an unnamed section by its order", () => {
    sessionSetup({ sessions: [makeSession(0, { name: "" }), makeSession(1)] });
    expect(screen.getAllByText("Section 1").length).toBeGreaterThan(0);
  });
});

describe("MockTestRunner pause", () => {
  it("pauses, shows the frozen clock and drops the stale cache", async () => {
    pauseMock.mockResolvedValue(ok(PAUSED));
    cacheAttempt(makeStartData());
    const { user } = setup();
    await user.click(first("Pause Test"));
    const dialog = await screen.findByRole("dialog", { name: "Test Paused" });
    expect(within(dialog).getByText("10m 00s")).toBeInTheDocument();
    expect(within(dialog).getByText("50m 00s")).toBeInTheDocument();
    expect(readCachedAttempt("att1")).toBeNull();
  });

  it("ignores a second pause tap while one is in flight", async () => {
    pauseMock.mockReturnValue(new Promise(() => undefined));
    const { user } = setup();
    await user.click(first("Pause Test"));
    await user.click(first("Pause Test"));
    expect(pauseMock).toHaveBeenCalledTimes(1);
  });

  it("ignores a second resume tap while one is in flight", async () => {
    resumeMock.mockReturnValue(new Promise(() => undefined));
    const { user } = setup({ initialPaused: true });
    await user.click(first("Resume Test"));
    await user.click(first("Resume Test"));
    expect(resumeMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces a pause failure and keeps running", async () => {
    pauseMock.mockResolvedValue(fail("Cannot pause"));
    const { user } = setup();
    await user.click(first("Pause Test"));
    expect(await screen.findByRole("status")).toHaveTextContent("Cannot pause");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("resumes with the server clock and merged answers", async () => {
    resumeMock.mockResolvedValue(
      ok(
        makeResumeData({
          questions: [
            makeQuestion("q1", { selectedOption: "q1-b" }),
            makeQuestion("q2"),
            makeQuestion("q3"),
          ],
          timeRemaining: 1800,
        }),
      ),
    );
    const { user } = setup({ initialPaused: true });
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Resume Test",
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("timer")).toHaveAttribute(
      "aria-label",
      "Time left 30:00",
    );
    expect(screen.getByRole("radio", { name: "B of q1" })).toBeChecked();
    expect(readCachedAttempt("att1")).not.toBeNull();
  });

  it("resumes from the palette toggle", async () => {
    resumeMock.mockResolvedValue(ok(makeResumeData()));
    const { user } = setup({ initialPaused: true });
    await user.click(first("Resume Test"));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  });

  it("shows a resume failure on the overlay", async () => {
    resumeMock.mockResolvedValue(fail("Server asleep"));
    const { user } = setup({ initialPaused: true });
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Resume Test",
      }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Server asleep");
    expect(
      screen.getByRole("dialog", { name: "Test Paused" }),
    ).toBeInTheDocument();
  });

  it("exits from the pause overlay without pausing twice", async () => {
    const { user } = setup({ initialPaused: true });
    await user.click(
      screen.getByRole("button", { name: "Exit to Chapter Wise" }),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/mocks/exam/exam1/chapter-wise"),
    );
    expect(pauseMock).not.toHaveBeenCalled();
    // Soft Nav can keep the runner mounted — do not leave "Saving & Exiting...".
    expect(
      screen.getByRole("button", { name: "Exit to Chapter Wise" }),
    ).toBeEnabled();
    expect(screen.queryByText("Saving & Exiting...")).toBeNull();
  });

  it("pauses then leaves from the back-button dialog", async () => {
    pauseMock.mockResolvedValue(ok(PAUSED));
    cacheAttempt(makeStartData());
    const { user } = setup();
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    const dialog = await screen.findByRole("dialog", {
      name: "Leave the exam?",
    });
    await user.click(
      within(dialog).getByRole("button", { name: "Pause & Leave" }),
    );
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith("/mocks/exam/exam1/chapter-wise"),
    );
    expect(readCachedAttempt("att1")).toBeNull();
  });

  it("stays in the exam when the student changes their mind", async () => {
    const { user } = setup();
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await user.click(
      await screen.findByRole("button", { name: "Stay in Exam" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("keeps the student in the exam when pause-and-leave fails", async () => {
    pauseMock.mockResolvedValue(fail("Pause failed"));
    const { user } = setup();
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await user.click(
      await screen.findByRole("button", { name: "Pause & Leave" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Pause failed");
    expect(push).not.toHaveBeenCalled();
  });

  it("keepalive-pauses on pagehide", () => {
    setup();
    window.dispatchEvent(new Event("pagehide"));
    expect(pauseAttemptKeepalive).toHaveBeenCalledWith("att1");
  });
});

describe("MockTestRunner submit", () => {
  it("summarises the paper and lets the student review again", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    const dialog = await openSubmit(user);
    expect(within(dialog).getByText("Answered: 1")).toBeInTheDocument();
    expect(within(dialog).getByText("Not Answered: 2")).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Review Again" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the summary from the desktop palette", async () => {
    const { user } = setup();
    await user.click(first("Submit Test"));
    expect(
      screen.getByRole("dialog", { name: "Submit Test?" }),
    ).toBeInTheDocument();
  });

  it("submits every answer, disarms the guards and finishes with the language", async () => {
    submitMock.mockResolvedValue(ok(makeSubmitResult()));
    cacheAttempt(makeStartData());
    const { user, onFinished } = setup();
    await user.click(screen.getByRole("radio", { name: "A of q1" }));
    await user.click(screen.getByRole("radio", { name: "മലയാളം" }));
    const dialog = await openSubmit(user);
    await user.click(
      within(dialog).getByRole("button", { name: "Submit Test" }),
    );

    await waitFor(() => expect(onFinished).toHaveBeenCalledWith("ml"));
    expect(submitMock).toHaveBeenCalledWith("att1", [
      { questionId: "q1", selectedOptionId: "q1-a" },
    ]);
    expect(readCachedAttempt("att1")).toBeNull();

    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    window.dispatchEvent(new Event("pagehide"));
    expect(pauseAttemptKeepalive).not.toHaveBeenCalled();
  });

  it("shows the error and reopens the dialog when submitting fails", async () => {
    submitMock.mockResolvedValue(fail("Submit failed"));
    const { user, onFinished } = setup();
    const dialog = await openSubmit(user);
    await user.click(
      within(dialog).getByRole("button", { name: "Submit Test" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Submit failed");
    expect(onFinished).not.toHaveBeenCalled();
  });

  it("auto-submits when time is up", async () => {
    submitMock.mockResolvedValue(ok(makeSubmitResult()));
    const { onFinished } = setup({ initialSecondsLeft: 0 });
    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
    expect(submitMock).toHaveBeenCalledTimes(1);
  });

  it("does not time out while paused", async () => {
    const { onFinished } = setup({
      initialPaused: true,
      initialSecondsLeft: 0,
    });
    await Promise.resolve();
    expect(onFinished).not.toHaveBeenCalled();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("refuses to submit if a pause lands while the dialog is open", async () => {
    pauseMock.mockResolvedValue(ok(PAUSED));
    const { user } = setup();
    const dialog = await openSubmit(user);
    await user.click(first("Pause Test"));
    await screen.findByRole("dialog", { name: "Test Paused" });
    await user.click(
      within(dialog).getByRole("button", { name: "Submit Test" }),
    );
    expect(submitMock).not.toHaveBeenCalled();
  });
});

describe("MockTestRunner session-wise", () => {
  it("shows the section summary and starts the next section", async () => {
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: false,
        sessions: [],
        currentSessionIndex: 1,
        nextSession: sessionResume(1),
      }),
    );
    const { user, onFinished } = sessionSetup();
    await user.click(first("Save & Next"));
    await user.click(first("Next Section"));
    const dialog = screen.getByRole("dialog", { name: "Exam Summary" });
    expect(
      within(dialog).getByText(/cannot return to this section/i),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Next Section" }),
    );

    expect(await screen.findAllByText("Section 2")).not.toHaveLength(0);
    expect(screen.getByRole("timer")).toHaveAttribute(
      "aria-label",
      "Time left 28:20",
    );
    expect(
      screen.getByRole("heading", { name: "Question No 1" }),
    ).toBeInTheDocument();
    expect(onFinished).not.toHaveBeenCalled();
    expect(submitMock).not.toHaveBeenCalled();
  });

  async function submitSection(user: ReturnType<typeof userEvent.setup>) {
    await user.click(first("Save & Next"));
    await user.click(first("Next Section"));
    await user.click(
      within(screen.getByRole("dialog", { name: "Exam Summary" })).getByRole(
        "button",
        {
          name: "Next Section",
        },
      ),
    );
  }

  it("finishes when the last section completes the paper", async () => {
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: true,
        sessions: [],
        currentSessionIndex: 1,
        results: makeSubmitResult(),
      }),
    );
    const { user, onFinished } = sessionSetup();
    await submitSection(user);
    await waitFor(() => expect(onFinished).toHaveBeenCalledWith("en"));
  });

  it("recovers when the response was lost but the section had completed", async () => {
    completeMock.mockResolvedValue(fail("timeout"));
    resumeMock.mockResolvedValue(ok(sessionResume(1)));
    const { user } = sessionSetup();
    await submitSection(user);
    expect(await screen.findByRole("status")).toHaveTextContent(
      /already submitted/i,
    );
    expect(completeMock).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("Section 2").length).toBeGreaterThan(0);
  });

  it("retries once when the section is still open", async () => {
    completeMock.mockResolvedValueOnce(fail("timeout")).mockResolvedValueOnce(
      ok<CompleteSessionResult>({
        paperCompleted: false,
        sessions: [],
        currentSessionIndex: 1,
        nextSession: sessionResume(1),
      }),
    );
    resumeMock.mockResolvedValue(ok(sessionResume(0)));
    const { user } = sessionSetup();
    await submitSection(user);
    await waitFor(() => expect(completeMock).toHaveBeenCalledTimes(2));
    expect((await screen.findAllByText("Section 2")).length).toBeGreaterThan(0);
  });

  it("reports the failure when the retry also fails", async () => {
    completeMock.mockResolvedValue(fail("still down"));
    resumeMock.mockResolvedValue(ok(sessionResume(0)));
    const { user } = sessionSetup();
    await submitSection(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("still down");
  });

  it("reports a generic error when the retry returns an unusable payload", async () => {
    completeMock.mockResolvedValueOnce(fail("timeout")).mockResolvedValueOnce(
      ok<CompleteSessionResult>({
        paperCompleted: false,
        sessions: [],
        currentSessionIndex: 0,
      }),
    );
    resumeMock.mockResolvedValue(ok(sessionResume(0)));
    const { user } = sessionSetup();
    await submitSection(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not complete this section/i,
    );
  });

  it("treats a completed paper without results as unusable", async () => {
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: true,
        sessions: [],
        currentSessionIndex: 1,
      }),
    );
    resumeMock.mockResolvedValue(fail("offline"));
    const { user, onFinished } = sessionSetup();
    await submitSection(user);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not complete this section/i,
    );
    expect(onFinished).not.toHaveBeenCalled();
  });

  it("re-syncs quietly when the section is closed but the index did not move", async () => {
    completeMock.mockResolvedValue(fail("timeout"));
    resumeMock.mockResolvedValue(
      ok(
        makeResumeData({
          questions: [
            makeQuestion("q1"),
            makeQuestion("q2"),
            makeQuestion("q3"),
            makeQuestion("q4"),
          ],
          mockTestData: makeMockTestData({
            isSessionWise: true,
            currentSessionIndex: 0,
            sessions: [makeSession(0, { status: "COMPLETED" }), makeSession(1)],
          }),
        }),
      ),
    );
    const { user } = sessionSetup();
    await submitSection(user);
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(completeMock).toHaveBeenCalledTimes(1);
  });

  it("treats a missing section index as the first section", async () => {
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: true,
        sessions: [],
        currentSessionIndex: 1,
        results: makeSubmitResult(),
      }),
    );
    const data = makeMockTestData({
      isSessionWise: true,
      sessions: [makeSession(0), makeSession(1)],
    });
    const { user, onFinished } = setup({
      mockTestData: data,
      questions: [
        makeQuestion("q1"),
        makeQuestion("q2"),
        makeQuestion("q3"),
        makeQuestion("q4"),
      ],
    });
    await submitSection(user);
    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
  });

  it("shows paper-wide time on the pause screen of a later section", async () => {
    pauseMock.mockResolvedValue(ok({ ...PAUSED, totalTimeConsumed: 2400 }));
    const { user } = sessionSetup({
      currentSessionIndex: 1,
      sessions: [
        makeSession(0, { status: "COMPLETED" }),
        makeSession(1, { status: "IN_PROGRESS", name: "Chemistry" }),
      ],
    });
    await user.click(first("Pause Test"));
    const dialog = await screen.findByRole("dialog", { name: "Test Paused" });
    expect(
      within(dialog).getByText(
        /Paper so far: 40m 00s · this section: Chemistry/,
      ),
    ).toBeInTheDocument();
  });

  it("falls back to the original error when the re-sync fails too", async () => {
    completeMock.mockResolvedValue(fail("timeout"));
    resumeMock.mockResolvedValue(fail("offline"));
    const { user } = sessionSetup();
    await submitSection(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("timeout");
  });

  /**
   * The UI blocks this (pause disables Submit), but a pause can land while the
   * summary dialog is open, so the confirm handler still has to cope.
   */
  async function submitPausedSection(user: ReturnType<typeof userEvent.setup>) {
    pauseMock.mockResolvedValue(ok(PAUSED));
    await user.click(first("Save & Next"));
    await user.click(first("Next Section"));
    await user.click(first("Pause Test"));
    await screen.findByRole("dialog", { name: "Test Paused" });
    await user.click(
      within(screen.getByRole("dialog", { name: "Exam Summary" })).getByRole(
        "button",
        {
          name: "Next Section",
        },
      ),
    );
  }

  it("resumes a paused section before completing it", async () => {
    resumeMock.mockResolvedValue(ok(sessionResume(0)));
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: true,
        sessions: [],
        currentSessionIndex: 1,
        results: makeSubmitResult(),
      }),
    );
    const { user, onFinished } = sessionSetup();
    await submitPausedSection(user);
    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
    expect(resumeMock).toHaveBeenCalledTimes(1);
  });

  it("stops when a paused section cannot be resumed before completing", async () => {
    resumeMock.mockResolvedValue(fail("no resume"));
    const { user, onFinished } = sessionSetup();
    await submitPausedSection(user);
    expect(await screen.findByRole("alert", { name: "" })).toBeInTheDocument();
    expect(completeMock).not.toHaveBeenCalled();
    expect(onFinished).not.toHaveBeenCalled();
  });

  it("auto-completes the section when time is up", async () => {
    completeMock.mockResolvedValue(
      ok<CompleteSessionResult>({
        paperCompleted: true,
        sessions: [],
        currentSessionIndex: 1,
        results: makeSubmitResult(),
      }),
    );
    const { onFinished } = sessionSetup({}, { initialSecondsLeft: 0 });
    await waitFor(() => expect(onFinished).toHaveBeenCalledTimes(1));
    expect(completeMock).toHaveBeenCalledTimes(1);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("labels the final section's loader as a submit", async () => {
    completeMock.mockReturnValue(new Promise(() => undefined));
    const { user } = sessionSetup({
      currentSessionIndex: 1,
      sessions: [
        makeSession(0, { status: "COMPLETED" }),
        makeSession(1, { status: "IN_PROGRESS" }),
      ],
    });
    await user.click(first("Save & Next"));
    await user.click(first("Submit Test"));
    await user.click(
      within(screen.getByRole("dialog", { name: "Exam Summary" })).getByRole(
        "button",
        {
          name: "Submit Test",
        },
      ),
    );
    expect(
      await screen.findByText("Submitting your test..."),
    ).toBeInTheDocument();
  });

  describe("palette grouping by subject", () => {
    const subjectQuestions = [
      makeQuestion("q1", { subject: "phy", subjectName: "Physics" }),
      makeQuestion("q2", { subject: "phy", subjectName: "Physics" }),
      makeQuestion("q3", { subject: "chem", subjectName: "Chemistry" }),
    ];

    it("groups the palette by subject on a full mock", () => {
      setup({
        mockTestData: makeMockTestData({
          paperType: "FULL_EXAM",
          subject: undefined,
        }),
        questions: subjectQuestions,
      });
      expect(
        screen.getAllByRole("group", { name: "Physics" }).length,
      ).toBeGreaterThan(0);
      expect(
        screen.getAllByRole("group", { name: "Chemistry" }).length,
      ).toBeGreaterThan(0);
    });

    it.each(["TOPIC_WISE", "SPRINT"] as const)(
      "keeps the flat palette for %s papers",
      (paperType) => {
        setup({
          mockTestData: makeMockTestData({ paperType, subject: undefined }),
          questions: subjectQuestions,
        });
        expect(
          screen.queryByRole("group", { name: "Physics" }),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("group", { name: "Chemistry" }),
        ).not.toBeInTheDocument();
      },
    );

    it("lets a student jump to a subject's question from its group", async () => {
      const { user } = setup({
        mockTestData: makeMockTestData({
          paperType: "FULL_EXAM",
          subject: undefined,
        }),
        questions: subjectQuestions,
      });
      const chemistry = screen.getAllByRole("group", {
        name: "Chemistry",
      })[0] as HTMLElement;
      await user.click(
        within(chemistry).getByRole("button", { name: /Question 3/ }),
      );
      expect(
        screen.getAllByRole("button", { name: /Question 3,/, current: true })
          .length,
      ).toBeGreaterThan(0);
    });
  });

  describe("palette button badge", () => {
    it("shows a number-free badge while questions are unvisited and hides it once all are visited", async () => {
      const { user } = setup();
      const badge = () => screen.queryByTestId("palette-not-visited-badge");
      // 3 questions, only the first is visited
      expect(badge()).toBeInTheDocument();
      expect(badge()).toBeEmptyDOMElement();
      await user.click(first(/Save & Next/i));
      expect(badge()).toBeInTheDocument();
      await user.click(first(/Save & Next/i));
      expect(badge()).not.toBeInTheDocument();
    });
  });
});
