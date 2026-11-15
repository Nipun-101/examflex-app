import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeTripTags } from "@/components/mistake-book/mistake-trip-tags";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeTripTags", () => {
  it("marks the active reason and notifies on change", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MistakeTripTags
        prompt={MISTAKE_BOOK_DATA.tripPrompt}
        options={MISTAKE_BOOK_DATA.tripReasons}
        value="concept-gap"
        onChange={onChange}
      />
    );

    expect(
      screen.getByRole("button", { name: "Concept gap" })
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Calculation" }));
    expect(onChange).toHaveBeenCalledWith("calculation");
  });
});
