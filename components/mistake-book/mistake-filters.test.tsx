import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeFilters } from "@/components/mistake-book/mistake-filters";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { chaptersForSubjectFilter } from "@/lib/mistake-book/selectors";

describe("MistakeFilters", () => {
  it("requires a subject before chapter options are available", async () => {
    const user = userEvent.setup();
    const onSubjectChange = vi.fn();
    const onChapterChange = vi.fn();

    const { rerender } = render(
      <MistakeFilters
        subjects={MISTAKE_BOOK_DATA.subjects}
        chapters={chaptersForSubjectFilter(MISTAKE_BOOK_DATA.chapters, "all")}
        subjectId="all"
        chapterId="all"
        onSubjectChange={onSubjectChange}
        onChapterChange={onChapterChange}
      />
    );

    expect(screen.getByLabelText("Chapter")).toBeDisabled();
    expect(screen.getByText("Select a subject first")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Subject"), "physics");
    expect(onSubjectChange).toHaveBeenCalledWith("physics");

    rerender(
      <MistakeFilters
        subjects={MISTAKE_BOOK_DATA.subjects}
        chapters={chaptersForSubjectFilter(
          MISTAKE_BOOK_DATA.chapters,
          "physics"
        )}
        subjectId="physics"
        chapterId="all"
        onSubjectChange={onSubjectChange}
        onChapterChange={onChapterChange}
      />
    );

    expect(screen.getByLabelText("Chapter")).not.toBeDisabled();
    await user.selectOptions(
      screen.getByLabelText("Chapter"),
      "laws-of-motion"
    );
    expect(onChapterChange).toHaveBeenCalledWith("laws-of-motion");
  });
});
