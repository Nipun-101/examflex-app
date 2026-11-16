import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuestionPanel } from "@/components/attempt/question-panel";
import { QUESTION_ZOOM_STEPS } from "@/lib/mocks/question-zoom";
import { makeQuestion } from "@/test-utils/attempt-fixtures";

function setup(
  overrides: Partial<Parameters<typeof QuestionPanel>[0]> = {}
) {
  const onSelectOption = vi.fn();
  const view = render(
    <QuestionPanel
      question={makeQuestion("q1")}
      number={7}
      language="en"
      zoomIndex={QUESTION_ZOOM_STEPS.indexOf(1)}
      selectedOptionId={undefined}
      onSelectOption={onSelectOption}
      {...overrides}
    />
  );
  return { onSelectOption, ...view };
}

describe("QuestionPanel", () => {
  it("shows the number, stem and options", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Question No 7" })).toBeInTheDocument();
    expect(screen.getByText("Question q1")).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("switches language", () => {
    setup({ language: "ml" });
    expect(screen.getByText("പ്രശ്നം q1")).toBeInTheDocument();
    expect(screen.getByText("എ q1")).toBeInTheDocument();
  });

  it("reports option selection and exposes checked state", async () => {
    const { onSelectOption } = setup({ selectedOptionId: "q1-b" });
    expect(screen.getByRole("radio", { name: "B of q1" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "A of q1" })).not.toBeChecked();
    await userEvent.click(screen.getByRole("radio", { name: "A of q1" }));
    expect(onSelectOption).toHaveBeenCalledWith("q1-a");
  });

  it("applies font-size zoom to the question body only", () => {
    setup({ zoomIndex: QUESTION_ZOOM_STEPS.length - 1 });
    const zoomed = screen.getByTestId("question-zoom");
    expect(zoomed.style.getPropertyValue("--question-zoom")).toBe("1.6");
    expect(zoomed).toHaveClass("question-zoom");
    expect(screen.getByRole("heading", { name: "Question No 7" })).not.toHaveAttribute(
      "style"
    );
  });

  it("renders question and option images", () => {
    setup({
      question: makeQuestion("q1", {
        questionText: {
          en: { text: "Look", imageUrl: "https://cdn/q.png" },
          ml: { text: "", imageUrl: null },
        },
        options: [
          { id: "i1", type: "image", en: "", ml: "", imageUrl: "https://cdn/o.png" },
        ],
      }),
    });
    expect(screen.getByRole("img", { name: "Question" })).toHaveAttribute("src", "https://cdn/q.png");
    expect(screen.getByRole("img", { name: "Option i1" })).toHaveAttribute("src", "https://cdn/o.png");
  });

  it("falls back to text when an image option has no url", () => {
    setup({
      question: makeQuestion("q1", {
        options: [{ id: "i1", type: "image", en: "Fallback", ml: "", imageUrl: null }],
      }),
    });
    expect(screen.getByText("Fallback")).toBeInTheDocument();
  });
});
