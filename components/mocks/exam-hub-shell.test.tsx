import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExamHubShell } from "@/components/mocks/exam-hub-shell";
import type { ApiExamDetail } from "@/types/exam";

const getExamById = vi.fn();

vi.mock("@/lib/api/exams", () => ({
  getExamById: (id: string) => getExamById(id),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/mocks/exam/ex1",
}));

const exam: ApiExamDetail = {
  id: "ex1",
  name: "NEET",
  isSessionWise: false,
  hasMultiLingualSupport: false,
  isActive: true,
};

describe("ExamHubShell", () => {
  beforeEach(() => {
    getExamById.mockReset();
  });

  it("keeps tab children mounted but hidden until the exam finishes loading", () => {
    getExamById.mockReturnValue(new Promise(() => {}));
    render(
      <ExamHubShell examId="ex1">
        <p>tab content</p>
      </ExamHubShell>
    );
    const tab = screen.getByText("tab content");
    expect(tab).toBeInTheDocument();
    expect(tab.parentElement).toHaveClass("hidden");
  });

  it("shows the exam name, tabs and children once loaded", async () => {
    getExamById.mockResolvedValue({ ok: true, data: exam });
    render(
      <ExamHubShell examId="ex1">
        <p>tab content</p>
      </ExamHubShell>
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "NEET" })
    ).toBeInTheDocument();
    expect(screen.getByText("tab content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Mocks/ })).toHaveAttribute(
      "href",
      "/mocks"
    );
    expect(
      screen.getByRole("navigation", { name: "Exam sections" })
    ).toBeInTheDocument();
  });

  it("shows a retryable error instead of the tabs content", async () => {
    const user = userEvent.setup();
    getExamById
      .mockResolvedValueOnce({ ok: false, message: "Could not load this exam." })
      .mockResolvedValueOnce({ ok: true, data: exam });
    render(
      <ExamHubShell examId="ex1">
        <p>tab content</p>
      </ExamHubShell>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load this exam."
    );
    expect(screen.getByText("tab content").parentElement).toHaveClass("hidden");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();

    await user.click(screen.getByRole("button", { name: /Try again/ }));
    expect(await screen.findByText("tab content")).toBeInTheDocument();
    expect(screen.getByText("tab content").parentElement).not.toHaveClass(
      "hidden"
    );
  });
});
