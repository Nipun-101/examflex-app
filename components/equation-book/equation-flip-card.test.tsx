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

    const mathNodes = await screen.findAllByTestId("mathpix-markdown");
    expect(mathNodes.length).toBeGreaterThan(0);
    expect(screen.getByText(/Memory trick/i)).toBeInTheDocument();
    expect(
      mathNodes.some((node) => node.textContent?.includes("Sigma first."))
    ).toBe(true);
  });

  it("renders memory trick through Mathpix so equations can display", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onReveal = vi.fn();
    const card = {
      ...TEST_EQUATIONS[0]!,
      mnemonic: "Remember $$E = mc^2$$ — energy first.",
    };

    const { rerender } = render(
      <MathpixBoundary>
        <EquationFlipCard card={card} revealed={false} onReveal={onReveal} />
      </MathpixBoundary>
    );

    await user.click(
      screen.getByRole("button", { name: /Flip to reveal the equation/i })
    );
    await act(async () => {
      vi.advanceTimersByTime(400);
    });

    rerender(
      <MathpixBoundary>
        <EquationFlipCard card={card} revealed onReveal={onReveal} />
      </MathpixBoundary>
    );

    expect(screen.getByText(/Memory trick/i)).toBeInTheDocument();
    expect(
      (await screen.findAllByTestId("mathpix-markdown")).some((node) =>
        node.textContent?.includes("$$E = mc^2$$")
      )
    ).toBe(true);
  });
});
