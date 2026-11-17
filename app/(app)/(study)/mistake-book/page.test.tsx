import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MistakeBookPage from "@/app/(app)/(study)/mistake-book/page";

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

describe("MistakeBookPage", () => {
  beforeEach(() => {
    vi.mocked(listMistakeBookSessions).mockReset();
  });

  it("renders the Mistake Book session list", async () => {
    vi.mocked(listMistakeBookSessions).mockResolvedValue({
      ok: true,
      data: {
        data: [
          {
            mockTestId: "mt-1",
            attemptId: "at-1",
            title: "Mock 12",
            paperType: "FULL_EXAM",
            remainingCount: 3,
            attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
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

    render(<MistakeBookPage />);

    expect(
      await screen.findByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("link", { name: /Mock 12/i })
    ).toHaveAttribute("href", "/mistake-book/mt-1");
    expect(screen.getByText(/3 mistakes/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(listMistakeBookSessions).toHaveBeenCalled();
    });
  });
});
