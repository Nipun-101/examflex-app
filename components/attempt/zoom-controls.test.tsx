import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ZoomControls } from "@/components/attempt/zoom-controls";
import { QUESTION_ZOOM_STEPS } from "@/lib/mocks/question-zoom";

describe("ZoomControls", () => {
  it("steps in and out", async () => {
    const onChange = vi.fn();
    render(<ZoomControls zoomIndex={2} onZoomIndexChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Zoom out question" }));
    await userEvent.click(screen.getByRole("button", { name: "Zoom in question" }));
    expect(onChange).toHaveBeenNthCalledWith(1, 1);
    expect(onChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("disables zoom out at 0.8x", () => {
    render(<ZoomControls zoomIndex={0} onZoomIndexChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Zoom out question" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom in question" })).toBeEnabled();
  });

  it("disables zoom in at 1.6x", () => {
    render(
      <ZoomControls
        zoomIndex={QUESTION_ZOOM_STEPS.length - 1}
        onZoomIndexChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: "Zoom in question" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom out question" })).toBeEnabled();
  });
});
