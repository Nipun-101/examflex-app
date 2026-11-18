import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MathpixBoundary } from "@/components/attempt/mathpix-boundary";
import { EquationFlipCard } from "@/components/equation-book/equation-flip-card";
import { TEST_EQUATIONS } from "@/lib/equation-book/test-fixtures";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

describe("EquationFlipCard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reveals equation content after flip", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onReveal = vi.fn();
    const { rerender } = render(
      <MathpixBoundary>
        <EquationFlipCard
          card={TEST_EQUATIONS[0]!}
          revealed={false}
          onReveal={onReveal}
        />
      </MathpixBoundary>
    );

    const flipButton = screen.getByRole("button", {
      name: /Flip to reveal the equation/i,
    });
    expect(flipButton.className).toContain("cursor-pointer");

    await user.click(flipButton);
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    expect(onReveal).toHaveBeenCalled();

    rerender(
      <MathpixBoundary>
        <EquationFlipCard
          card={TEST_EQUATIONS[0]!}
          revealed
          onReveal={onReveal}
        />
      </MathpixBoundary>
    );

    expect(
      (await screen.findAllByTestId("mathpix-markdown")).length
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Memory trick/i)).toBeInTheDocument();
  });
});
