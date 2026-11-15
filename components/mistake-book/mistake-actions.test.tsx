import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MistakePager,
  MistakeRemoveAction,
} from "@/components/mistake-book/mistake-actions";

describe("MistakePager", () => {
  it("wires previous and next", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();
    const onNext = vi.fn();

    render(
      <MistakePager
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

  it("disables pager ends", () => {
    render(
      <MistakePager
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

describe("MistakeRemoveAction", () => {
  it("wires the remove CTA", async () => {
    const user = userEvent.setup();
    const onUnderstood = vi.fn();

    render(
      <MistakeRemoveAction
        understoodLabel="Understood · remove from book"
        understoodHint="Removes this question from your Mistake Book."
        onUnderstood={onUnderstood}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /Understood · remove from book/i })
    );
    expect(onUnderstood).toHaveBeenCalledOnce();
    expect(
      screen.getByText(/Removes this question from your Mistake Book/i)
    ).toBeInTheDocument();
  });
});
