import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeFilters } from "@/components/mistake-book/mistake-filters";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeFilters", () => {
  it("notifies on subject and chapter changes", async () => {
    const user = userEvent.setup();
    const onSubjectChange = vi.fn();
    const onChapterChange = vi.fn();

    render(
      <MistakeFilters
        subjects={MISTAKE_BOOK_DATA.subjects}
        chapters={MISTAKE_BOOK_DATA.chapters}
        subjectId="all"
        chapterId="all"
        onSubjectChange={onSubjectChange}
        onChapterChange={onChapterChange}
      />
    );

    await user.selectOptions(screen.getByLabelText("Subject"), "physics");
    expect(onSubjectChange).toHaveBeenCalledWith("physics");

    await user.selectOptions(
      screen.getByLabelText("Chapter"),
      "laws-of-motion"
    );
    expect(onChapterChange).toHaveBeenCalledWith("laws-of-motion");
  });
});
