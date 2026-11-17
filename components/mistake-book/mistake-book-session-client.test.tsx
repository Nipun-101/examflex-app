import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MistakeBookSessionClient } from "@/components/mistake-book/mistake-book-session-client";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

vi.mock("@/lib/api/mistake-book", () => ({
  getMistakeBookSession: vi.fn(),
  deleteMistakeBookEntry: vi.fn(),
  patchMistakeTripReason: vi.fn(),
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

import {
  deleteMistakeBookEntry,
  getMistakeBookSession,
  patchMistakeTripReason,
} from "@/lib/api/mistake-book";

const detail = {
  mockTestId: "mt-1",
  attemptId: "at-1",
  title: "Mock 12",
  paperType: "FULL_EXAM" as const,
  remainingCount: 1,
  attemptSubmittedAt: "2026-11-17T10:00:00.000Z",
  subjects: [{ id: "s1", label: "Physics" }],
  chapters: [{ id: "t1", label: "Laws", subjectId: "s1" }],
  entries: [
    {
      id: "e1",
      kind: "incorrect" as const,
      subjectId: "s1",
      subjectLabel: "PHYSICS",
      chapterId: "t1",
      questionNumber: "Q1",
      prompt: "A sample prompt about friction",
      yourAnswerLabel: "YOUR ANSWER · A",
      yourAnswer: "1",
      correctAnswerLabel: "CORRECT · B",
      correctAnswer: "2",
      insightTitle: "The bit that changes the answer",
      insightBody: "Insight",
      insightFormula: "",
      sourceLabel: "",
      sourceHref: "",
      sourceHint: "hint",
      tripReason: "concept-gap" as const,
    },
  ],
};

describe("MistakeBookSessionClient", () => {
  beforeEach(() => {
    vi.mocked(getMistakeBookSession).mockReset();
    vi.mocked(deleteMistakeBookEntry).mockReset();
    vi.mocked(patchMistakeTripReason).mockReset();
  });

  it("loads the session and patches trip reason in the background", async () => {
    const user = userEvent.setup();
    vi.mocked(getMistakeBookSession).mockResolvedValue({
      ok: true,
      data: detail,
    });
    vi.mocked(patchMistakeTripReason).mockResolvedValue({
      ok: true,
      data: undefined,
    });

    render(<MistakeBookSessionClient mockTestId="mt-1" />);

    expect(
      await screen.findByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/sample prompt about friction/i).length
    ).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: "Calculation" }));
    await waitFor(() => {
      expect(patchMistakeTripReason).toHaveBeenCalledWith("e1", "calculation");
    });
  });

  it("removes an entry when Understood is confirmed", async () => {
    const user = userEvent.setup();
    vi.mocked(getMistakeBookSession).mockResolvedValue({
      ok: true,
      data: detail,
    });
    vi.mocked(deleteMistakeBookEntry).mockResolvedValue({
      ok: true,
      data: undefined,
    });

    render(<MistakeBookSessionClient mockTestId="mt-1" />);
    expect(
      await screen.findByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /Understood · remove from book/i })
    );

    await waitFor(() => {
      expect(deleteMistakeBookEntry).toHaveBeenCalledWith("e1");
    });
    expect(
      await screen.findByText(/Nothing left in this paper/i)
    ).toBeInTheDocument();
  });
});
