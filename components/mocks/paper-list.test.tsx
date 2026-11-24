import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaperList } from "@/components/mocks/paper-list";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import type { PaperCardData } from "@/lib/mocks/paper-card-model";
import type { FetchPaperPage, PaperPage } from "@/lib/mocks/paper-page";

const push = vi.fn();
const startMockTestAttempt = vi.fn();
const resumeAttempt = vi.fn();
const getAttempt = vi.fn();
const getProductsForMockTest = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/mocks/exam/ex1",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/attempts", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "@/lib/api/attempts"
  );
  return {
    ...actual,
    startMockTestAttempt: (id: string) => startMockTestAttempt(id),
    resumeAttempt: (id: string) => resumeAttempt(id),
    getAttempt: (id: string) => getAttempt(id),
  };
});

/** Minimal GET /mock-test-attempts/:id payload for launch checks. */
function attemptDetails(status: string) {
  return {
    ok: true,
    data: {
      attemptId: "att9",
      status,
      timeRemaining: 120,
      timeElapsed: 60,
      test: {
        title: "Kinematics",
        durationInMinutes: 30,
        totalQuestions: 20,
        startedAt: "2026-01-01T00:00:00.000Z",
        marksPerQuestion: 4,
        negativeMarking: 1,
        passingScore: null,
        exam: { id: "ex1", name: "Exam", description: "" },
      },
      questions: [],
    },
  };
}

vi.mock("@/lib/api/catalog", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "@/lib/api/catalog"
  );
  return {
    ...actual,
    getProductsForMockTest: (id: string) => getProductsForMockTest(id),
  };
});

const card = (overrides: Partial<PaperCardData> = {}): PaperCardData => ({
  id: "p1",
  title: "Kinematics",
  subtitle: "Physics · Kinematics",
  eyebrow: "PHYSICS · KINEMATICS",
  kind: "chapter",
  subjectName: "Physics",
  topicName: "Kinematics",
  totalQuestions: 20,
  durationInMinutes: 30,
  totalMarks: 80,
  marksPerQuestion: 4,
  negativeMarking: 1,
  allowRetake: true,
  status: "new",
  attemptCount: 0,
  ...overrides,
});

const pagination = (overrides = {}) => ({
  total: 2,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
  ...overrides,
});

function page(items: PaperCardData[], extra = {}): PaperPage {
  return { items, pagination: pagination(extra) };
}

function renderList(fetchPage: FetchPaperPage) {
  return render(
    <StudyLoadingProvider>
      <PaperList
        title="Chapter Wise"
        description="Focused papers."
        paperType="TOPIC_WISE"
        fetchPage={fetchPage}
      />
    </StudyLoadingProvider>
  );
}

describe("PaperList", () => {
  beforeEach(() => {
    push.mockReset();
    startMockTestAttempt.mockReset();
    resumeAttempt.mockReset();
    getAttempt.mockReset();
    getProductsForMockTest.mockReset();
    sessionStorage.clear();
  });

  it("shows a loading overlay then the papers", async () => {
    const fetchPage = vi.fn<FetchPaperPage>().mockResolvedValue({
      ok: true,
      data: page([card(), card({ id: "p2", title: "Dynamics" })]),
    });
    renderList(fetchPage);
    expect(screen.getByText("Loading your study space...")).toBeInTheDocument();

    expect(await screen.findByText("Kinematics")).toBeInTheDocument();
    expect(screen.getByText("Dynamics")).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledWith(1);
    expect(screen.queryByRole("navigation", { name: /pages/ })).toBeNull();
  });

  it("shows the empty state", async () => {
    renderList(vi.fn<FetchPaperPage>().mockResolvedValue({ ok: true, data: page([]) }));
    expect(await screen.findByTestId("papers-empty-state")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /Nothing here yet, but it's on the way/i,
      })
    ).toBeInTheDocument();
  });

  it("shows an error and retries", async () => {
    const user = userEvent.setup();
    const fetchPage = vi
      .fn<FetchPaperPage>()
      .mockResolvedValueOnce({ ok: false, message: "Could not load" })
      .mockResolvedValueOnce({ ok: true, data: page([card()]) });
    renderList(fetchPage);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load");
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    expect(await screen.findByText("Kinematics")).toBeInTheDocument();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("paginates", async () => {
    const user = userEvent.setup();
    const fetchPage = vi.fn<FetchPaperPage>().mockImplementation(async (n) => ({
      ok: true,
      data: page([card({ id: `p${n}`, title: `Paper ${n}` })], {
        page: n,
        totalPages: 2,
        hasNextPage: n === 1,
        hasPrevPage: n === 2,
      }),
    }));
    renderList(fetchPage);

    expect(await screen.findByText("Paper 1")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Previous/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Next/ }));
    expect(await screen.findByText("Paper 2")).toBeInTheDocument();
    expect(fetchPage).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: /Next/ })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Previous/ }));
    expect(await screen.findByText("Paper 1")).toBeInTheDocument();
  });

  it("starts a paper and opens the attempt", async () => {
    const user = userEvent.setup();
    startMockTestAttempt.mockResolvedValue({
      ok: true,
      data: { attemptId: "att1" },
    });
    renderList(
      vi.fn<FetchPaperPage>().mockResolvedValue({
        ok: true,
        data: page([card(), card({ id: "p2", title: "Dynamics" })]),
      })
    );
    await screen.findByText("Kinematics");

    await user.click(screen.getAllByRole("button", { name: "Start" })[0] as HTMLElement);

    expect(startMockTestAttempt).toHaveBeenCalledWith("p1");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/mocks/attempt/att1"));
    // Launch lock releases after navigation so Soft Nav / back cannot stick CTAs.
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Start" })[0]).toBeEnabled();
    });
  });

  const inProgressCard = () =>
    card({
      status: "in_progress",
      userAttemptAction: "RESUME",
      resumeAttemptId: "att9",
      answeredCount: 2,
      timeRemainingSeconds: 120,
    });

  it("resumes an in-progress paper without unpausing it from the list", async () => {
    const user = userEvent.setup();
    getAttempt.mockResolvedValue(attemptDetails("PAUSED"));
    renderList(
      vi.fn<FetchPaperPage>().mockResolvedValue({
        ok: true,
        data: page([inProgressCard()]),
      })
    );
    await user.click(await screen.findByRole("button", { name: "Resume →" }));
    expect(getAttempt).toHaveBeenCalledWith("att9");
    expect(resumeAttempt).not.toHaveBeenCalled();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/mocks/attempt/att9"));
    // The attempt page unpauses once the runner is ready.
    expect(
      sessionStorage.getItem("examflex:mockAttemptAutoResume:att9")
    ).toBe("1");
  });

  it("refreshes the card in place when the attempt already expired", async () => {
    const user = userEvent.setup();
    getAttempt.mockResolvedValue(attemptDetails("EXPIRED"));
    const fetchPage = vi
      .fn<FetchPaperPage>()
      .mockResolvedValueOnce({ ok: true, data: page([inProgressCard()]) })
      .mockResolvedValueOnce({
        ok: true,
        data: page([
          card({
            status: "completed",
            userAttemptAction: "RETAKE",
            attemptCount: 1,
            lastAttemptId: "att9",
          }),
        ]),
      });
    renderList(fetchPage);

    await user.click(await screen.findByRole("button", { name: "Resume →" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Time ran out on this attempt"
    );
    expect(await screen.findByRole("button", { name: "Retry" })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Resume →" })).toBeNull();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/mocks/attempt/att9/result"
    );
    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(fetchPage).toHaveBeenLastCalledWith(1);
    expect(push).not.toHaveBeenCalled();
    expect(resumeAttempt).not.toHaveBeenCalled();
  });

  it("refreshes the card when Start finds an attempt already running", async () => {
    const user = userEvent.setup();
    startMockTestAttempt.mockResolvedValue({
      ok: false,
      status: 409,
      message: "server",
      code: "ATTEMPT_ALREADY_ACTIVE",
    });
    const fetchPage = vi
      .fn<FetchPaperPage>()
      .mockResolvedValueOnce({ ok: true, data: page([card()]) })
      .mockResolvedValueOnce({ ok: true, data: page([inProgressCard()]) });
    renderList(fetchPage);

    await user.click(await screen.findByRole("button", { name: "Start" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "You already have this test in progress."
    );
    expect(await screen.findByRole("button", { name: "Resume →" })).toBeEnabled();
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("opens plans for a locked paper", async () => {
    const user = userEvent.setup();
    getProductsForMockTest.mockResolvedValue({
      ok: true,
      data: { products: [], commerceEnabled: true },
    });
    renderList(
      vi.fn<FetchPaperPage>().mockResolvedValue({
        ok: true,
        data: page([
          card({ access: { allowed: false, reason: "ENTITLEMENT_REQUIRED" } }),
        ]),
      })
    );
    await user.click(await screen.findByRole("button", { name: /View plans/ }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(getProductsForMockTest).toHaveBeenCalledWith("p1");

    const [close] = screen.getAllByRole("button", { name: "Close" });
    await user.click(close as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the entitlement banner with View plans, then dismisses", async () => {
    const user = userEvent.setup();
    startMockTestAttempt.mockResolvedValue({
      ok: false,
      status: 403,
      message: "server",
      code: "ENTITLEMENT_REQUIRED",
    });
    getProductsForMockTest.mockResolvedValue({
      ok: true,
      data: { products: [], commerceEnabled: true },
    });
    renderList(
      vi.fn<FetchPaperPage>().mockResolvedValue({ ok: true, data: page([card()]) })
    );
    await user.click(await screen.findByRole("button", { name: "Start" }));

    const banner = await screen.findByRole("alert");
    expect(banner).toHaveTextContent(
      "This test needs an active plan. View plans to unlock it."
    );
    expect(push).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /View plans/ }));
    expect(getProductsForMockTest).toHaveBeenCalledWith("p1");
    await user.keyboard("{Escape}");

    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows other launch errors without View plans", async () => {
    const user = userEvent.setup();
    startMockTestAttempt.mockResolvedValue({ ok: false, message: "Boom" });
    renderList(
      vi.fn<FetchPaperPage>().mockResolvedValue({ ok: true, data: page([card()]) })
    );
    await user.click(await screen.findByRole("button", { name: "Start" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Boom");
    expect(screen.queryByRole("button", { name: /View plans/ })).toBeNull();
  });

  it("ignores a page that arrives after unmount", async () => {
    let finish: (value: Awaited<ReturnType<FetchPaperPage>>) => void = () => {};
    const fetchPage = vi.fn<FetchPaperPage>().mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { unmount } = renderList(fetchPage);
    unmount();
    finish({ ok: true, data: page([card()]) });
    await Promise.resolve();
    expect(screen.queryByText("Kinematics")).not.toBeInTheDocument();
  });
});
