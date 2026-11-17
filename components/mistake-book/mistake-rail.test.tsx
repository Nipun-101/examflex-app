import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeRail } from "@/components/mistake-book/mistake-rail";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeRail", () => {
  it("renders nothing when empty", () => {
    const { container } = render(
      <MistakeRail
        mistakes={[]}
        activeIndex={0}
        mockLabel="KINEMATICS - 1"
        onSelect={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("lists metadata rows and selects an index", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <MistakeRail
        mistakes={MISTAKE_BOOK_DATA.mistakes}
        activeIndex={0}
        mockLabel="KINEMATICS - 1"
        onSelect={onSelect}
      />
    );

    expect(screen.getByText("In this review")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Q34 · PHYSICS · KINEMATICS - 1",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Q18 · PHYSICS · KINEMATICS - 1",
      })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Q18 · PHYSICS · KINEMATICS - 1" })
    );
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it("falls back to a generic mock label when title is empty", () => {
    render(
      <MistakeRail
        mistakes={[MISTAKE_BOOK_DATA.mistakes[0]!]}
        activeIndex={0}
        mockLabel=""
        onSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Q34 · PHYSICS · This mock" })
    ).toBeInTheDocument();
  });
});
