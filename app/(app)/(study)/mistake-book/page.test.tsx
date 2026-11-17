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
            attemptSubmittedAt: new Date().toISOString(),
            subjectIds: ["s1"],
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
        summary: {
          totalMistakes: 3,
          sessionCount: 1,
          bySubject: [{ id: "s1", label: "Physics", count: 3 }],
          subjects: [{ id: "s1", label: "Physics" }],
          chapters: [{ id: "t1", label: "Mechanics", subjectId: "s1" }],
          startWith: { mockTestId: "mt-1", title: "Mock 12" },
        },
      },
    });

    render(<MistakeBookPage />);

    expect(
      await screen.findByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    const sessionLinks = await screen.findAllByRole("link", {
      name: /Mock 12/i,
    });
    expect(
      sessionLinks.some((link) => link.getAttribute("href") === "/mistake-book/mt-1")
    ).toBe(true);
    expect(screen.getAllByText("mistakes").length).toBeGreaterThan(0);
    expect(screen.getByText("Physics 3")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Start with Mock 12/i })
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(listMistakeBookSessions).toHaveBeenCalled();
    });
  });
});
