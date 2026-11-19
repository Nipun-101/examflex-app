import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EquationBookView } from "@/components/equation-book/equation-book-view";
import {
  TEST_EQUATIONS,
  TEST_EXAMS,
  TEST_SUBJECTS,
} from "@/lib/equation-book/test-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

describe("EquationBookView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders the first card and advances with Next", async () => {
    const user = userEvent.setup();
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={TEST_EQUATIONS}
        initialSubjectId="sub-physics"
        initialTopicId="top-lom"
        onFiltersChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Equation Book" })
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 2 equations")).toBeInTheDocument();
    const cardTitle = screen.getByRole("heading", {
      name: "Net force on a free body?",
    });
    expect(cardTitle).toBeInTheDocument();
    expect(cardTitle).toHaveClass("break-words");
    expect(cardTitle.closest("article")).toHaveClass("min-w-0");
    expect(
      screen.getByRole("progressbar", {
        name: /Progress through Laws of motion/i,
      }).previousElementSibling?.querySelector("p")
    ).toHaveClass("min-w-0");

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(screen.getByText("2 of 2 equations")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Static friction limit?" })
    ).toBeInTheDocument();
  });

  it("flips the card to reveal the equation", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={TEST_EQUATIONS}
        initialSubjectId="sub-physics"
        initialTopicId="top-lom"
        onFiltersChange={vi.fn()}
      />
    );

    expect(screen.getByText(/DON'T PEEK YET/i)).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Flip to reveal the equation/i })
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const mathNodes = await screen.findAllByTestId("mathpix-markdown");
    expect(mathNodes[0]).toHaveTextContent("$$\\Sigma F = ma$$");
    expect(screen.getByText(/LOCKED IN/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("hides a previously revealed equation when returning to it", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={TEST_EQUATIONS}
        initialSubjectId="sub-physics"
        initialTopicId="top-lom"
        onFiltersChange={vi.fn()}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /Flip to reveal the equation/i })
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.getByText(/LOCKED IN/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(
      screen.getByRole("heading", { name: "Static friction limit?" })
    ).toBeInTheDocument();
    expect(screen.getByText(/DON'T PEEK YET/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Previous/i }));
    expect(
      screen.getByRole("heading", { name: "Net force on a free body?" })
    ).toBeInTheDocument();
    expect(screen.getByText(/DON'T PEEK YET/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Flip to reveal the equation/i })
    ).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("notifies filter changes when switching subject", async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn();
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={TEST_EQUATIONS}
        initialSubjectId="sub-physics"
        initialTopicId="top-lom"
        onFiltersChange={onFiltersChange}
      />
    );

    await user.click(screen.getByRole("tab", { name: "Chemistry" }));
    expect(onFiltersChange).toHaveBeenCalledWith({
      subjectId: "sub-chem",
      topicId: "top-eq",
    });
  });

  it("shows empty state when there are no cards", () => {
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={[]}
        initialSubjectId="sub-physics"
        initialTopicId="top-lom"
        onFiltersChange={vi.fn()}
      />
    );
    expect(
      screen.getByRole("heading", {
        name: "Your deck is waiting for its first card.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 0 equations")).toBeInTheDocument();
    expect(screen.getByText(/IN THIS CHAPTER/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse all/i })
    ).toHaveAttribute("href", "/equation-book/browse");
  });

  it("defaults to the first subject and chapter when none are provided", () => {
    render(
      <EquationBookView
        examId="exam-neet"
        examName="NEET"
        availableExams={TEST_EXAMS}
        subjects={TEST_SUBJECTS}
        cards={TEST_EQUATIONS}
        onFiltersChange={vi.fn()}
      />
    );

    expect(screen.getByRole("tab", { name: "Physics" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByLabelText("Chapter")).toHaveValue("top-lom");
    expect(
      screen.getByText("Tap another subject or chapter to keep exploring.")
    ).toBeInTheDocument();
  });
});
