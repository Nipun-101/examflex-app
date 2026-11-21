import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionPalette } from "@/components/attempt/question-palette";
import type { QuestionStatus } from "@/types/attempt-runner";

const statuses: QuestionStatus[] = [
  "answered",
  "not-answered",
  "marked",
  "marked-answered",
  "not-visited",
];

function setup(overrides: Partial<Parameters<typeof QuestionPalette>[0]> = {}) {
  const props = {
    statuses,
    currentIndex: 1,
    onSelect: vi.fn(),
    isPaused: false,
    onTogglePause: vi.fn(),
    testTitle: "Kinematics",
    onSubmit: vi.fn(),
    submitLabel: "Submit Test",
    ...overrides,
  };
  render(<QuestionPalette {...props} />);
  return props;
}

describe("QuestionPalette", () => {
  it("lists every question with a status label and marks the current one", () => {
    setup();
    expect(
      screen.getByRole("button", { name: "Question 1, answered" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Question 4, answered and marked for review",
      }),
    ).toBeInTheDocument();
    const current = screen.getByRole("button", {
      name: "Question 2, not answered",
    });
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current.className).toContain("bg-study-lime");
    expect(
      screen.getByRole("button", { name: "Question 1, answered" }),
    ).toHaveClass("bg-study-green");
    expect(
      screen.getByRole("button", { name: "Question 3, marked for review" }),
    ).toHaveStyle({ backgroundColor: "#4f446c" });
    expect(
      screen.getByRole("button", {
        name: "Question 4, answered and marked for review",
      }),
    ).toHaveStyle({ backgroundColor: "#4f446c" });
  });

  it("selects a question", async () => {
    const props = setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Question 5, not visited" }),
    );
    expect(props.onSelect).toHaveBeenCalledWith(4);
  });

  it("counts each status in the legend", () => {
    setup();
    const legend = screen.getByRole("region", { name: "Legend" });
    expect(within(legend).getByText("Marked & Answered")).toBeInTheDocument();
    expect(within(legend).getAllByText("1")).toHaveLength(5);
  });

  it("shows the default or section subtitle", () => {
    setup();
    expect(screen.getByText("Mock Test Attempt")).toBeInTheDocument();
    expect(screen.getByText("Question Palette:")).toBeInTheDocument();
  });

  it("shows the section name for session-wise papers", () => {
    setup({ sectionTitle: "Physics A" });
    expect(screen.getByText("Physics A")).toBeInTheDocument();
    expect(screen.getByText("Physics A :")).toBeInTheDocument();
  });

  it("pauses and submits", async () => {
    const props = setup();
    await userEvent.click(screen.getByRole("button", { name: /Pause Test/ }));
    await userEvent.click(screen.getByRole("button", { name: "Submit Test" }));
    expect(props.onTogglePause).toHaveBeenCalledTimes(1);
    expect(props.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("offers resume and disables submit while paused", () => {
    setup({ isPaused: true });
    expect(
      screen.getByRole("button", { name: /Resume Test/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Test" })).toBeDisabled();
  });

  describe("grouped by subject (full mocks)", () => {
    const groups = [
      { id: "phy", name: "Physics", indices: [0, 1] },
      { id: "chem", name: "Chemistry", indices: [2, 3, 4] },
    ];

    it("shows each subject's name above its questions", () => {
      setup({ groups });
      const physics = screen.getByRole("group", { name: "Physics" });
      const chemistry = screen.getByRole("group", { name: "Chemistry" });
      expect(within(physics).getAllByRole("button")).toHaveLength(2);
      expect(within(chemistry).getAllByRole("button")).toHaveLength(3);
      expect(
        within(physics).getByRole("heading", { name: /Physics/ }),
      ).toBeInTheDocument();
      expect(
        within(chemistry).getByRole("button", {
          name: "Question 3, marked for review",
        }),
      ).toBeInTheDocument();
    });

    it("keeps paper numbering and selects by paper index", async () => {
      const props = setup({ groups });
      await userEvent.click(
        within(screen.getByRole("group", { name: "Chemistry" })).getByRole(
          "button",
          {
            name: /Question 5/,
          },
        ),
      );
      expect(props.onSelect).toHaveBeenCalledWith(4);
    });

    it("marks the current question inside its group", () => {
      setup({ groups, currentIndex: 3 });
      const current = screen.getByRole("button", { name: /Question 4,/ });
      expect(current).toHaveAttribute("aria-current", "true");
      expect(screen.getAllByRole("button", { current: true })).toHaveLength(1);
    });

    it("renders the flat list with no group headings when groups are absent", () => {
      setup();
      expect(screen.queryByRole("group")).not.toBeInTheDocument();
      expect(
        screen.getAllByRole("button", { name: /^Question \d/ }),
      ).toHaveLength(5);
    });
  });

  describe("shapes", () => {
    const shapeOf = (name: string | RegExp) =>
      screen.getByRole("button", { name }).className;

    it("uses a trapezoid for answered and not-answered, a circle for marked states, and a rounded square for not visited", () => {
      setup({ currentIndex: 99 });
      expect(shapeOf("Question 1, answered")).toContain("clip-path");
      expect(shapeOf("Question 2, not answered")).toContain("clip-path");
      expect(shapeOf("Question 3, marked for review")).toContain(
        "rounded-full",
      );
      expect(shapeOf(/Question 4, answered and marked/)).toContain(
        "rounded-full",
      );
      const notVisited = shapeOf("Question 5, not visited");
      expect(notVisited).toContain("rounded-lg");
      expect(notVisited).not.toContain("clip-path");
    });

    it("keeps the current question ring-friendly (no clipping)", () => {
      setup({ currentIndex: 0 });
      const current = shapeOf(/Question 1,/);
      expect(current).not.toContain("clip-path");
      expect(current).toContain("ring-2");
    });

    it("keeps colours unchanged while changing shape", () => {
      setup({ currentIndex: 99 });
      expect(shapeOf("Question 1, answered")).toContain("bg-study-green");
      expect(shapeOf("Question 2, not answered")).toContain(
        "bg-study-peach-ink",
      );
    });
  });

  describe("scrolls to the active question on open", () => {
    const rect = (top: number) =>
      ({
        top,
        bottom: top + 40,
        left: 0,
        right: 0,
        width: 0,
        height: 40,
      }) as DOMRect;

    it("scrolls only the question list so the active row is at its top", () => {
      const spy = vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: HTMLElement) {
          if (this.getAttribute("aria-label")?.startsWith("Question 141,")) {
            return rect(900);
          }
          if (
            this.className.includes("overflow-y-auto") &&
            this.className.includes("max-h-")
          ) {
            return rect(100);
          }
          return rect(0);
        });
      const many: QuestionStatus[] = Array.from(
        { length: 180 },
        () => "not-visited",
      );
      const scrollIntoView = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoView;

      setup({ statuses: many, currentIndex: 140 });

      const list = screen
        .getByRole("button", { name: /Question 141,/ })
        .closest(".overflow-y-auto") as HTMLElement;
      // active row top (900) - list top (100) - list padding (0 in jsdom)
      expect(list.scrollTop).toBe(800);
      expect(scrollIntoView).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("does not scroll when the first question is active", () => {
      setup({ currentIndex: 0 });
      const list = screen
        .getByRole("button", { name: /Question 1,/ })
        .closest(".overflow-y-auto") as HTMLElement;
      expect(list.scrollTop).toBe(0);
    });
  });
});
