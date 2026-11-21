import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  QuestionMapFilters,
  ResultsQuestionMap,
  type ResultsMapGroup,
} from "@/components/attempt/results-question-map";

const GROUPS: ResultsMapGroup[] = [
  {
    id: "0",
    name: "Physics",
    rangeLabel: "1–2",
    summary: "1 correct · 1 wrong · 0 skipped",
    items: [
      { paperNumber: 1, questionId: "q1", outcome: "wrong" },
      { paperNumber: 2, questionId: "q2", outcome: "correct" },
    ],
  },
  {
    id: "1",
    name: "Chemistry",
    rangeLabel: "3–3",
    summary: "0 correct · 0 wrong · 1 skipped",
    items: [{ paperNumber: 3, questionId: "q3", outcome: "skipped" }],
  },
];

const COUNTS = { all: 3, wrong: 1, skipped: 1, correct: 1 };

function renderMap(
  overrides: Partial<Parameters<typeof ResultsQuestionMap>[0]> = {}
) {
  const props = {
    groups: GROUPS,
    currentPaperNumber: 2,
    onJump: vi.fn(),
    statusFilter: "all" as const,
    onStatusChange: vi.fn(),
    statusCounts: COUNTS,
    sections: [
      { id: 0, name: "Physics" },
      { id: 1, name: "Chemistry" },
    ],
    sectionFilter: null,
    onSectionChange: vi.fn(),
    ...overrides,
  };
  render(<ResultsQuestionMap {...props} />);
  return props;
}

describe("ResultsQuestionMap", () => {
  it("renders grouped outcomes, marks the current question and jumps on tap", async () => {
    const { onJump } = renderMap();

    expect(
      screen.getByRole("heading", { name: "Question map" })
    ).toBeInTheDocument();
    expect(screen.getByText("Tap to jump")).toBeInTheDocument();
    expect(screen.getByText("1 correct · 1 wrong · 0 skipped")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Chemistry/ })).toHaveTextContent(
      "Chemistry · 3–3"
    );
    expect(
      screen.getByRole("button", { name: "Question 2, correct" })
    ).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("button", { name: "Question 1, wrong" })
    ).not.toHaveAttribute("aria-current");

    await userEvent.click(
      screen.getByRole("button", { name: "Question 1, wrong" })
    );
    expect(onJump).toHaveBeenCalledWith(1);
  });

  it("shows a message when the filters leave nothing to show", () => {
    renderMap({ groups: [] });
    expect(screen.getByText("No questions match these filters.")).toBeInTheDocument();
  });

  it("shows the mini summary slot above the map", () => {
    renderMap({ miniSummary: <p>Mini summary</p> });
    expect(screen.getByText("Mini summary")).toBeInTheDocument();
  });
});

describe("QuestionMapFilters", () => {
  const base = {
    statusFilter: "all" as const,
    statusCounts: COUNTS,
    sectionFilter: null,
    onStatusChange: vi.fn(),
    onSectionChange: vi.fn(),
  };

  it("puts All / Wrong / Skipped / Correct in one row and subjects in another", () => {
    render(
      <QuestionMapFilters
        {...base}
        sections={[
          { id: 0, name: "Physics" },
          { id: 1, name: "Chemistry" },
        ]}
      />
    );
    const status = screen.getByRole("group", {
      name: "Filter answer key by result",
    });
    expect(
      within(status)
        .getAllByRole("button")
        .map((button) => button.textContent)
    ).toEqual(["All 3", "Wrong 1", "Skipped 1", "Correct 1"]);
    expect(within(status).getByRole("button", { name: "All 3" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );

    const subjects = screen.getByRole("group", {
      name: "Filter answer key by subject",
    });
    expect(
      within(subjects)
        .getAllByRole("button")
        .map((button) => button.textContent)
    ).toEqual(["Physics", "Chemistry"]);
    // No "All" chip, and nothing selected by default.
    for (const button of within(subjects).getAllByRole("button")) {
      expect(button).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("tapping the selected subject again clears it", async () => {
    const onSectionChange = vi.fn();
    const sections = [
      { id: 0, name: "Physics" },
      { id: 1, name: "Chemistry" },
    ];
    const { rerender } = render(
      <QuestionMapFilters
        {...base}
        sections={sections}
        onSectionChange={onSectionChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Chemistry" }));
    expect(onSectionChange).toHaveBeenLastCalledWith(1);

    rerender(
      <QuestionMapFilters
        {...base}
        sections={sections}
        sectionFilter={1}
        onSectionChange={onSectionChange}
      />
    );
    expect(screen.getByRole("button", { name: "Chemistry" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    await userEvent.click(screen.getByRole("button", { name: "Chemistry" }));
    expect(onSectionChange).toHaveBeenLastCalledWith(null);
  });

  it("hides the subject row for single-section papers", () => {
    render(<QuestionMapFilters {...base} sections={[{ id: 0, name: "Only" }]} />);
    expect(
      screen.queryByRole("group", { name: "Filter answer key by subject" })
    ).not.toBeInTheDocument();
  });
});
