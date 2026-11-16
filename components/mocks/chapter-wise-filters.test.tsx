import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ChapterWiseFilters } from "@/components/mocks/chapter-wise-filters";

const subjects = [
  {
    id: "s1",
    name: "Physics",
    topics: [
      { id: "t1", name: "Units" },
      { id: "t2", name: "Motion" },
    ],
  },
  {
    id: "s2",
    name: "Chemistry",
    topics: [{ id: "t3", name: "Mole" }],
  },
];

describe("ChapterWiseFilters", () => {
  it("keeps chapter disabled until a subject is chosen", () => {
    render(
      <ChapterWiseFilters
        subjects={subjects}
        subjectId=""
        topicId=""
        onSubjectChange={vi.fn()}
        onTopicChange={vi.fn()}
      />
    );
    expect(screen.getByLabelText("Chapter")).toBeDisabled();
  });

  it("lists topics for the selected subject and clears via callbacks", async () => {
    const onSubjectChange = vi.fn();
    const onTopicChange = vi.fn();
    render(
      <ChapterWiseFilters
        subjects={subjects}
        subjectId="s1"
        topicId=""
        onSubjectChange={onSubjectChange}
        onTopicChange={onTopicChange}
      />
    );
    expect(screen.getByLabelText("Chapter")).toBeEnabled();
    expect(screen.getByRole("option", { name: "Units" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Mole" })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText("Subject"), "s2");
    expect(onSubjectChange).toHaveBeenCalledWith("s2");
    await userEvent.selectOptions(screen.getByLabelText("Chapter"), "t1");
    expect(onTopicChange).toHaveBeenCalledWith("t1");
  });
});
