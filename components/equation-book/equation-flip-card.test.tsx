import { act, fireEvent, render, screen, within } from "@testing-library/react";
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

  it("keeps the narrow-screen width guards on the card, flip scene and equation body", async () => {
    const { container } = render(
      <MathpixBoundary>
        <EquationFlipCard
          card={TEST_EQUATIONS[0]!}
          revealed
          onReveal={vi.fn()}
        />
      </MathpixBoundary>
    );
    await screen.findAllByTestId("mathpix-markdown");

    // card and title wrap instead of widening the page
    expect(container.querySelector("article")).toHaveClass("min-w-0");
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass(
      "break-words",
      "[overflow-wrap:anywhere]"
    );
    // the flip scene is clipped to the card width
    expect(container.querySelector(".equation-flip-scene")).toHaveClass("min-w-0");
    // wide equations / memory tricks scroll inside the card, not the page
    const scrollers = Array.from(
      container.querySelectorAll(".equation-flip-face--back .overflow-x-auto")
    );
    expect(scrollers.length).toBeGreaterThanOrEqual(2);
    for (const node of scrollers) {
      expect(node).toHaveClass("min-w-0");
    }
  });

  describe("container height follows the visible face", () => {
    type Callback = () => void;
    const observers: Array<{
      callback: Callback;
      observed: Element[];
      disconnect: ReturnType<typeof vi.fn>;
    }> = [];
    let faceHeight = 0;
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "scrollHeight"
    );

    beforeEach(() => {
      observers.length = 0;
      faceHeight = 120;
      class FakeResizeObserver {
        entry = {
          callback: undefined as unknown as Callback,
          observed: [] as Element[],
          disconnect: vi.fn(),
        };
        constructor(callback: Callback) {
          this.entry.callback = callback;
          observers.push(this.entry);
        }
        observe(element: Element) {
          this.entry.observed.push(element);
        }
        disconnect() {
          this.entry.disconnect();
        }
        unobserve() {}
      }
      vi.stubGlobal("ResizeObserver", FakeResizeObserver);
      Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get() {
          return faceHeight;
        },
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      if (originalScrollHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          "scrollHeight",
          originalScrollHeight
        );
      } else {
        delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
      }
    });

    function renderRevealed() {
      return render(
        <MathpixBoundary>
          <EquationFlipCard
            card={TEST_EQUATIONS[0]!}
            revealed
            onReveal={vi.fn()}
          />
        </MathpixBoundary>
      );
    }

    it("sizes the container to the face, then grows it when the equation renders taller", async () => {
      const { container } = renderRevealed();
      const inner = container.querySelector(".equation-flip-inner") as HTMLElement;
      expect(inner.style.height).toBe("120px");

      // late math rendering / tablet re-wrap makes the face taller
      faceHeight = 305.4;
      await act(async () => {
        observers.at(-1)!.callback();
      });
      expect(inner.style.height).toBe("306px"); // rounded up, never clipped

      faceHeight = 180;
      await act(async () => {
        observers.at(-1)!.callback();
      });
      expect(inner.style.height).toBe("180px");
    });

    it("observes the face that is showing and stops observing on unmount", () => {
      const { container, unmount } = renderRevealed();
      const back = container.querySelector(".equation-flip-face--back");
      expect(observers.at(-1)!.observed).toEqual([back]);
      unmount();
      expect(observers.at(-1)!.disconnect).toHaveBeenCalled();
    });

    it("observes the front face before the card is flipped", () => {
      const { container } = render(
        <MathpixBoundary>
          <EquationFlipCard
            card={TEST_EQUATIONS[0]!}
            revealed={false}
            onReveal={vi.fn()}
          />
        </MathpixBoundary>
      );
      const front = container.querySelector(".equation-flip-face--front");
      expect(observers.at(-1)!.observed).toEqual([front]);
    });
  });

  describe("equation picture", () => {
    const withImage = {
      ...TEST_EQUATIONS[0]!,
      imageUrl: "https://cdn/force-diagram.png",
    };

    function renderCard(card = withImage) {
      return render(
        <MathpixBoundary>
          <EquationFlipCard card={card} revealed onReveal={vi.fn()} />
        </MathpixBoundary>
      );
    }

    it("shows the picture under the equation once it is revealed", async () => {
      const { container } = renderCard();
      await screen.findAllByTestId("mathpix-markdown");
      const picture = screen.getByRole("img", {
        name: "Net force on a free body? illustration",
      });
      expect(picture).toHaveAttribute("src", "https://cdn/force-diagram.png");
      // on the back (revealed) face, not the front
      expect(
        container.querySelector(".equation-flip-face--back")
      ).toContainElement(picture);
      expect(
        container.querySelector(".equation-flip-face--front")
      ).not.toContainElement(picture);
      // follows the equation in the DOM
      const equationBlock = container.querySelector(
        ".equation-flip-face--back [data-testid='mathpix-markdown']"
      );
      expect(
        equationBlock!.compareDocumentPosition(picture) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ).toBeTruthy();
    });

    it("keeps the picture inside the card on narrow screens and tall images", () => {
      renderCard();
      const picture = screen.getByRole("img", {
        name: "Net force on a free body? illustration",
      });
      expect(picture).toHaveClass("max-w-full", "max-h-80", "w-auto", "h-auto");
      // thumbnail button shrinks with the card; its row centres it
      const button = picture.closest("button") as HTMLElement;
      expect(button).toHaveClass("max-w-full", "min-w-0");
      expect(button.parentElement).toHaveClass("min-w-0", "justify-center");
    });

    it("loads the picture right away (it is already on screen when revealed)", () => {
      renderCard();
      expect(
        screen.getByRole("img", { name: /illustration/ })
      ).toHaveAttribute("loading", "eager");
    });

    it("shows a notice instead of a blank gap if the picture fails to load", () => {
      renderCard();
      fireEvent.error(screen.getByRole("img", { name: /illustration/ }));
      expect(screen.getByRole("status")).toHaveTextContent(
        "Image couldn't be loaded"
      );
      // the rest of the card is unaffected
      expect(screen.getByText(/Memory trick/i)).toBeInTheDocument();
    });

    it("lets the student open the picture full size, outside the 3D card", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const { container } = renderCard();
      await user.click(
        screen.getByRole("button", {
          name: "View Net force on a free body? illustration full size",
        })
      );
      const dialog = screen.getByRole("dialog", { name: "Net force on a free body?" });
      expect(dialog).toBeInTheDocument();
      expect(container.querySelector(".equation-flip-scene")).not.toContainElement(dialog);
      expect(
        within(dialog).getByRole("img", { name: /full size/ })
      ).toHaveAttribute("src", "https://cdn/force-diagram.png");
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders no picture block for an equation without one", () => {
      const { container } = renderCard(TEST_EQUATIONS[0]!);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
      expect(container.querySelector("img")).toBeNull();
    });
  });
});

