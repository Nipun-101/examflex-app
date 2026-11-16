import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExamOverview } from "@/components/mocks/exam-overview";
import {
  ExamPageContext,
  type ExamPageContextValue,
} from "@/hooks/use-exam-page";
import type { ApiExamDetail } from "@/types/exam";

vi.mock("@/lib/api/catalog", () => ({
  getProductsForExam: vi.fn().mockResolvedValue({
    ok: true,
    data: { products: [], commerceEnabled: true },
  }),
  getProductsForMockTest: vi.fn(),
  offerPricePaise: vi.fn(),
  sellableOffers: vi.fn(() => []),
}));

const exam: ApiExamDetail = {
  id: "ex1",
  name: "NEET",
  description: "  National entrance exam.  ",
  duration: 200,
  totalQuestions: 180,
  totalMarks: 720,
  isSessionWise: false,
  hasMultiLingualSupport: true,
  isActive: true,
  subjects: [
    {
      subject: "PHY",
      name: "Physics",
      numberOfQuestions: 45,
      marksPerQuestion: 4,
      hasNegativeMarking: true,
      negativeMarksPerQuestion: 1,
    },
    {
      subject: "CHE",
      numberOfQuestions: 45,
      marksPerQuestion: 1,
      hasNegativeMarking: false,
      negativeMarksPerQuestion: 0,
    },
  ],
};

function renderOverview(value: Partial<ExamPageContextValue>) {
  return render(
    <ExamPageContext.Provider
      value={{
        examId: "ex1",
        exam,
        loading: false,
        error: null,
        reload: () => {},
        ...value,
      }}
    >
      <ExamOverview />
    </ExamPageContext.Provider>
  );
}

describe("ExamOverview", () => {
  it("renders nothing while loading or without an exam", () => {
    const { container, rerender } = renderOverview({ loading: true });
    expect(container).toBeEmptyDOMElement();
    rerender(
      <ExamPageContext.Provider
        value={{
          examId: "ex1",
          exam: null,
          loading: false,
          error: "x",
          reload: () => {},
        }}
      >
        <ExamOverview />
      </ExamPageContext.Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the description, stats and structure", () => {
    renderOverview({});
    expect(screen.getByText("National entrance exam.")).toBeInTheDocument();
    expect(screen.getByText("3h 20min")).toBeInTheDocument();
    expect(screen.getByText("180")).toBeInTheDocument();
    expect(screen.getByText("720")).toBeInTheDocument();
    expect(screen.getByText("Single paper")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("Subject")).toBeInTheDocument();
    expect(screen.getByText(/−1 negative/)).toBeInTheDocument();
    expect(screen.getByText(/no negative marking/)).toBeInTheDocument();
    expect(
      screen.getByText(/supports English and Malayalam/)
    ).toBeInTheDocument();
  });

  it("falls back when description, stats and structure are missing", () => {
    const { subjects: _subjects, description: _description, ...rest } = exam;
    void _subjects;
    void _description;
    renderOverview({
      exam: {
        ...rest,
        isSessionWise: true,
        hasMultiLingualSupport: false,
      },
    });
    expect(screen.getByText(/Pick Chapter Wise/)).toBeInTheDocument();
    expect(screen.getByText("Session-wise")).toBeInTheDocument();
    expect(
      screen.getByText(/Structure for this exam will be available soon/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Malayalam/)).not.toBeInTheDocument();
  });

  it("shows session time per subject on session-wise exams", () => {
    renderOverview({
      exam: {
        ...exam,
        isSessionWise: true,
        subjects: [
          {
            subject: "PHY",
            name: "Physics",
            numberOfQuestions: 45,
            marksPerQuestion: 4,
            hasNegativeMarking: false,
            negativeMarksPerQuestion: 0,
            sessionTime: 60,
          },
        ],
      },
    });
    expect(screen.getByText(/1h/)).toBeInTheDocument();
  });

  it("opens and closes the exam plans dialog", async () => {
    const user = userEvent.setup();
    renderOverview({});
    await user.click(screen.getByRole("button", { name: /View plans/i }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    const [closeIcon] = screen.getAllByRole("button", { name: "Close" });
    await user.click(closeIcon as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
