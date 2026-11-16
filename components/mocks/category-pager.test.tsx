import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  CategoryPager,
  categoryPagerHint,
} from "@/components/mocks/category-pager";

describe("CategoryPager", () => {
  it("hides when there is only one page", () => {
    const { container } = render(
      <CategoryPager
        page={1}
        totalPages={1}
        hasPrevPage={false}
        hasNextPage={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("wires prev and next", async () => {
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(
      <CategoryPager
        page={2}
        totalPages={3}
        hasPrevPage
        hasNextPage
        onPrev={onPrev}
        onNext={onNext}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Previous category" }));
    await userEvent.click(screen.getByRole("button", { name: "Next category" }));
    expect(onPrev).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(categoryPagerHint(2, 3)).toContain("Category 2 of 3");
  });
});
