import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeRail } from "@/components/mistake-book/mistake-rail";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeRail", () => {
  it("renders nothing when empty", () => {
    const { container } = render(
      <MistakeRail mistakes={[]} activeIndex={0} onSelect={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists mistakes and selects an index", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <MistakeRail
        mistakes={MISTAKE_BOOK_DATA.mistakes}
        activeIndex={0}
        onSelect={onSelect}
      />
    );

    expect(screen.getByText("In this review")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Q18/i }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });
});
