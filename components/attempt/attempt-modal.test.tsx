import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AttemptModal } from "@/components/attempt/attempt-modal";

function setup(
  props: Partial<Parameters<typeof AttemptModal>[0]> = {}
) {
  const onClose = vi.fn();
  render(
    <>
      <button type="button">Outside</button>
      <AttemptModal open onClose={onClose} labelledBy="t" {...props}>
        <h2 id="t">Title</h2>
        <button type="button">First</button>
        <button type="button">Last</button>
      </AttemptModal>
    </>
  );
  return { onClose };
}

describe("AttemptModal", () => {
  it("renders nothing when closed", () => {
    render(
      <AttemptModal open={false} onClose={vi.fn()} labelledBy="t">
        <h2 id="t">Title</h2>
      </AttemptModal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("is labelled, modal and focused on open", () => {
    setup({ describedBy: "desc" });
    const dialog = screen.getByRole("dialog", { name: "Title" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-describedby", "desc");
    expect(dialog).toHaveFocus();
  });

  it("omits aria-describedby when not provided", () => {
    setup();
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby");
  });

  it("closes on Escape and backdrop click when dismissible", async () => {
    const { onClose } = setup();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("ignores clicks inside the panel", async () => {
    const { onClose } = setup();
    await userEvent.click(screen.getByText("Title"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("cannot be dismissed when blocking", async () => {
    const { onClose } = setup({ dismissible: false });
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("traps Tab and Shift+Tab inside the panel", async () => {
    setup();
    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });

    last.focus();
    await userEvent.tab();
    expect(first).toHaveFocus();

    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();

    screen.getByRole("dialog").focus();
    await userEvent.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("lets Tab move normally between inner controls", async () => {
    setup();
    const first = screen.getByRole("button", { name: "First" });
    first.focus();
    await userEvent.tab();
    expect(screen.getByRole("button", { name: "Last" })).toHaveFocus();
  });

  it("keeps focus on the panel when nothing is focusable", async () => {
    render(
      <AttemptModal open onClose={vi.fn()} labelledBy="t">
        <h2 id="t">Title</h2>
      </AttemptModal>
    );
    await userEvent.tab();
    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("returns focus to the opener on close", () => {
    const { rerender } = render(
      <>
        <button type="button">Opener</button>
        <AttemptModal open={false} onClose={vi.fn()} labelledBy="t">
          <h2 id="t">Title</h2>
        </AttemptModal>
      </>
    );
    const opener = screen.getByRole("button", { name: "Opener" });
    opener.focus();
    rerender(
      <>
        <button type="button">Opener</button>
        <AttemptModal open onClose={vi.fn()} labelledBy="t">
          <h2 id="t">Title</h2>
        </AttemptModal>
      </>
    );
    expect(screen.getByRole("dialog")).toHaveFocus();
    rerender(
      <>
        <button type="button">Opener</button>
        <AttemptModal open={false} onClose={vi.fn()} labelledBy="t">
          <h2 id="t">Title</h2>
        </AttemptModal>
      </>
    );
    expect(opener).toHaveFocus();
  });

  it("renders the sheet variant", () => {
    setup({ variant: "sheet" });
    expect(screen.getByRole("dialog").className).toContain("max-w-sm");
  });

  it("skips focus restore when nothing was focused before opening", () => {
    const spy = vi.spyOn(document, "activeElement", "get").mockReturnValue(null);
    const { unmount } = render(
      <AttemptModal open onClose={vi.fn()} labelledBy="t">
        <h2 id="t">Title</h2>
      </AttemptModal>
    );
    expect(() => unmount()).not.toThrow();
    spy.mockRestore();
  });

  describe("variants", () => {
    it("sizes the lightbox to its content and caps it to the viewport", () => {
      setup({ variant: "lightbox" });
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass(
        "w-auto",
        "max-h-[94dvh]",
        "max-w-[min(96vw,64rem)]",
        "overflow-auto"
      );
      expect(dialog).not.toHaveClass("max-w-lg", "w-full");
      // centred with a small gutter like the default dialog
      expect(dialog.parentElement).toHaveClass("items-center", "justify-center");
    });

    it("keeps the default dialog and the sheet exactly as before", () => {
      const { unmount } = render(
        <AttemptModal open onClose={vi.fn()} labelledBy="t">
          <h2 id="t">T</h2>
        </AttemptModal>
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveClass("max-w-lg", "w-full", "max-h-[90dvh]", "overflow-y-auto", "p-5");
      expect(dialog).not.toHaveClass("max-w-[min(96vw,64rem)]");
      unmount();

      render(
        <AttemptModal open onClose={vi.fn()} labelledBy="t" variant="sheet">
          <h2 id="t">T</h2>
        </AttemptModal>
      );
      const sheet = screen.getByRole("dialog");
      expect(sheet).toHaveClass("h-full", "w-[88%]", "max-w-sm");
      expect(sheet.parentElement).toHaveClass("justify-end");
    });

    it("appends custom panel classes for every variant", () => {
      setup({ variant: "lightbox", panelClassName: "extra-panel" });
      expect(screen.getByRole("dialog")).toHaveClass("extra-panel");
    });
  });
});

