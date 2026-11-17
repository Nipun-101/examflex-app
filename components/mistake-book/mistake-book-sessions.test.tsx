import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MistakeBookSessions } from "@/components/mistake-book/mistake-book-sessions";

vi.mock("@/lib/api/mistake-book", () => ({
  listMistakeBookSessions: vi.fn(),
}));

vi.mock("@/components/study/study-loading-overlay", () => ({
  StudyLoadingOverlay: ({
    open,
    label,
  }: {
    open: boolean;
    label?: string;
  }) => (open ? <div role="status">{label}</div> : null),
}));

import { listMistakeBookSessions } from "@/lib/api/mistake-book";

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

  it("links each session into its review route", async () => {
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
            attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
            subjectLabel: "Physics",
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
      },
    });

    render(<MistakeBookSessions />);
    expect(
      await screen.findByRole("link", { name: /Measurements/i })
    ).toHaveAttribute("href", "/mistake-book/mt-9");
  });
});
