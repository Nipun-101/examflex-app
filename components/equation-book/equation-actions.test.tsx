import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  EquationActions,
  EquationCtas,
  EquationPager,
} from "@/components/equation-book/equation-actions";

describe("EquationPager", () => {
  it("wires previous and next", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <EquationPager
        canGoPrevious
        canGoNext
        onPrevious={onPrevious}
        onNext={onNext}
      />
    );

    await user.click(screen.getByRole("button", { name: /Previous/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("disables prev/next at the ends", () => {
    render(
      <EquationPager
        canGoPrevious={false}
        canGoNext={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: /Previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Next/i })).toBeDisabled();
  });
});

describe("EquationCtas", () => {
  it("renders destination links", () => {
    render(
      <EquationCtas
        mockLabel="Take Laws of motion mock  →"
        mockHref="/mocks"
        browseLabel="Just looking for a formula? Browse all  →"
        browseHref="/equation-book/browse"
      />
    );

    expect(
      screen.getByRole("link", { name: /Take Laws of motion mock/i })
    ).toHaveAttribute("href", "/mocks");
    expect(
      screen.getByRole("link", { name: /Browse all/i })
    ).toHaveAttribute("href", "/equation-book/browse");
  });

  it("supports mock click handler", async () => {
    const user = userEvent.setup();
    const onMockClick = vi.fn();
    render(
      <EquationCtas
        mockLabel="Take Laws of motion mock  →"
        mockHref="/mocks"
        browseLabel="Browse all  →"
        browseHref="/equation-book/browse"
        onMockClick={onMockClick}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /Take Laws of motion mock/i })
    );
    expect(onMockClick).toHaveBeenCalledOnce();
  });
});

describe("EquationActions", () => {
  it("composes pager and destination links", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <EquationActions
        canGoPrevious
        canGoNext
        onPrevious={onPrevious}
        onNext={onNext}
        mockLabel="Take Laws of motion mock  →"
        mockHref="/mocks"
        browseLabel="Just looking for a formula? Browse all  →"
        browseHref="/equation-book/browse"
      />
    );

    await user.click(screen.getByRole("button", { name: /Previous/i }));
    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();

    expect(
      screen.getByRole("link", { name: /Take Laws of motion mock/i })
    ).toHaveAttribute("href", "/mocks");
    expect(
      screen.getByRole("link", { name: /Browse all/i })
    ).toHaveAttribute("href", "/equation-book/browse");
  });

  it("accepts a layout className", () => {
    const { container } = render(
      <EquationActions
        canGoPrevious={false}
        canGoNext
        onPrevious={vi.fn()}
        onNext={vi.fn()}
        mockLabel="Take mock  →"
        mockHref="/mocks"
        browseLabel="Browse all  →"
        browseHref="/equation-book/browse"
        className="mt-2"
      />
    );

    expect(container.firstElementChild).toHaveClass("mt-2");
  });
});
