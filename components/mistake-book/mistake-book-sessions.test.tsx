import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MistakeBookSessions } from "@/components/mistake-book/mistake-book-sessions";

vi.mock("@/lib/api/mistake-book", () => ({
  listMistakeBookSessions: vi.fn(),
}));

vi.mock("@/components/study/study-route-loading", () => ({
  StudyRouteLoading: ({ busy }: { busy: boolean }) =>
    busy ? <div role="status">Loading your study space...</div> : null,
  StudyRouteLoadingFallback: () => (
    <div role="status">Loading your study space...</div>
  ),
}));

import { listMistakeBookSessions } from "@/lib/api/mistake-book";

const emptySummary = {
  totalMistakes: 0,
  sessionCount: 0,
  bySubject: [] as Array<{ id: string; label: string; count: number }>,
  subjects: [] as Array<{ id: string; label: string }>,
  chapters: [] as Array<{ id: string; label: string; subjectId: string }>,
  startWith: null,
};

const populatedSummary = {
  totalMistakes: 1,
  sessionCount: 1,
  bySubject: [{ id: "s1", label: "Physics", count: 1 }],
  subjects: [{ id: "s1", label: "Physics" }],
  chapters: [{ id: "t1", label: "Units", subjectId: "s1" }],
  startWith: { mockTestId: "mt-9", title: "Measurements" },
};

describe("MistakeBookSessions", () => {
  beforeEach(() => {
    vi.mocked(listMistakeBookSessions).mockReset();
  });

  it("shows an empty state when there are no sessions", async () => {
    vi.mocked(listMistakeBookSessions).mockResolvedValue({
      ok: true,
      data: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: emptySummary,
      },
    });

    render(<MistakeBookSessions />);
    expect(
      await screen.findByTestId("mistake-book-empty-state")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Nothing to review/i })
    ).toBeInTheDocument();
  });

  it("lists sessions attempt-wise with subject/chapter filters and summary", async () => {
    const user = userEvent.setup();
    vi.mocked(listMistakeBookSessions).mockResolvedValue({
      ok: true,
      data: {
        data: [
          {
            mockTestId: "mt-9",
            attemptId: "at-9",
            title: "Measurements",
            paperType: "TOPIC_WISE",
            remainingCount: 1,
            attemptSubmittedAt: new Date().toISOString(),
            subjectLabel: "Physics",
            topicLabel: "Units",
            subjectIds: ["s1"],
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
        summary: populatedSummary,
      },
    });

    render(<MistakeBookSessions />);
    expect(
      await screen.findByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    const links = await screen.findAllByRole("link", {
      name: /Measurements/i,
    });
    expect(
      links.some((link) => link.getAttribute("href") === "/mistake-book/mt-9")
    ).toBe(true);
    expect(
      screen.getByRole("link", { name: /Start with Measurements/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Physics 1")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /All 1/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Chapter")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Subject"), "s1");
    expect(listMistakeBookSessions).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: "s1" })
    );
  });
});
