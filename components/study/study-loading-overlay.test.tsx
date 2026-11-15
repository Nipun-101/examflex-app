import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { STUDY_LOADING_DEFAULT_LABEL } from "@/lib/study/loading";

describe("StudyLoadingOverlay", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<StudyLoadingOverlay open={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("blocks interaction and shows the default label when open", async () => {
    const user = userEvent.setup();
    const behindClick = vi.fn();

    render(
      <div>
        <button type="button" onClick={behindClick}>
          Behind
        </button>
        <StudyLoadingOverlay open />
      </div>
    );

    const overlay = await screen.findByRole("alertdialog", {
      name: STUDY_LOADING_DEFAULT_LABEL,
    });
    expect(
      screen.getByText(/Every attempt takes you one step further/i)
    ).toBeInTheDocument();
    expect(overlay).toHaveClass("place-items-center");

    await user.click(overlay);
    expect(behindClick).not.toHaveBeenCalled();
  });

  it("locks body scroll for viewport scope and restores it on close", async () => {
    document.body.style.overflow = "auto";

    const { rerender } = render(
      <StudyLoadingOverlay open scope="viewport" label="Syncing" />
    );

    await screen.findByRole("alertdialog", { name: "Syncing" });
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<StudyLoadingOverlay open={false} scope="viewport" />);
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(document.body.style.overflow).toBe("auto");
  });

  it("uses absolute positioning for parent scope", () => {
    render(
      <div className="relative">
        <StudyLoadingOverlay open scope="parent" label="Saving" />
      </div>
    );

    expect(screen.getByRole("alertdialog", { name: "Saving" })).toHaveClass(
      "absolute"
    );
  });

  it("stops keyboard events from reaching the page behind", async () => {
    const onKeyDown = vi.fn();

    render(
      <div onKeyDown={onKeyDown}>
        <StudyLoadingOverlay open label="Working" />
      </div>
    );

    const overlay = await screen.findByRole("alertdialog", {
      name: "Working",
    });
    fireEvent.keyDown(overlay, { key: "Escape" });

    expect(onKeyDown).not.toHaveBeenCalled();
  });
});
