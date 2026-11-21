import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { EquationImage } from "@/components/equation-book/equation-image";

const SRC = "https://cdn/force-diagram.png";
const TITLE = "Net force on a free body?";

function setup(props: Partial<Parameters<typeof EquationImage>[0]> = {}) {
  return render(
    <div data-testid="card" style={{ transform: "rotateY(0deg)" }}>
      <EquationImage src={SRC} title={TITLE} className="max-h-80 w-auto" {...props} />
    </div>
  );
}

const openButton = () =>
  screen.getByRole("button", { name: `View ${TITLE} illustration full size` });

afterEach(() => {
  document.body.style.overflow = "";
});

describe("EquationImage", () => {
  it("shows the picture as a button to enlarge it", () => {
    setup();
    const thumb = within(openButton()).getByRole("img", {
      name: `${TITLE} illustration`,
    });
    expect(thumb).toHaveAttribute("src", SRC);
    expect(thumb).toHaveClass("max-h-80", "w-auto", "max-w-full");
    expect(within(openButton()).getByText("Enlarge")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("passes the loading hint to the thumbnail", () => {
    setup({ loading: "eager" });
    expect(screen.getByRole("img")).toHaveAttribute("loading", "eager");
  });

  it("opens a labelled full-size view that fits the viewport", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(openButton());

    const dialog = screen.getByRole("dialog", { name: TITLE });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const full = within(dialog).getByRole("img", {
      name: `${TITLE} illustration, full size`,
    });
    expect(full).toHaveAttribute("src", SRC);
    expect(full).toHaveAttribute("loading", "eager");
    // never larger than the screen, whatever the picture's own size
    expect(full).toHaveClass(
      "max-w-full",
      "max-h-[calc(94dvh-6rem)]",
      "object-contain",
      "w-auto",
      "h-auto"
    );
    // the panel itself is capped to the viewport too, and scrolls if it must
    expect(dialog).toHaveClass("max-h-[94dvh]", "max-w-[min(96vw,64rem)]", "overflow-auto");
  });

  it("renders the viewer on <body>, outside a transformed card", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(openButton());
    const dialog = screen.getByRole("dialog");
    // a `fixed` overlay inside the flip card's 3D transform would be trapped in it
    expect(screen.getByTestId("card")).not.toContainElement(dialog);
    expect(document.body.contains(dialog)).toBe(true);
    expect(dialog.closest("[data-testid='card']")).toBeNull();
  });

  it("closes with the close button, Escape and a backdrop click, and returns focus", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(openButton());
    await user.click(screen.getByRole("button", { name: "Close picture" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton()).toHaveFocus();

    await user.click(openButton());
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton()).toHaveFocus();

    await user.click(openButton());
    const backdrop = screen.getByRole("dialog").parentElement as HTMLElement;
    fireEvent.mouseDown(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays open when the picture or panel is clicked", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(openButton());
    await user.click(screen.getByRole("img", { name: /full size/ }));
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("locks page scrolling while open and restores it afterwards", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "auto";
    setup();
    await user.click(openButton());
    expect(document.body.style.overflow).toBe("hidden");
    await user.keyboard("{Escape}");
    expect(document.body.style.overflow).toBe("auto");
  });

  it("restores scrolling if it is unmounted while open", async () => {
    const user = userEvent.setup();
    const { unmount } = setup();
    await user.click(openButton());
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps keyboard focus inside the viewer (Tab is trapped)", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(openButton());
    const close = screen.getByRole("button", { name: "Close picture" });
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus(); // only one control: focus wraps onto itself
  });

  it("opens from the keyboard", async () => {
    const user = userEvent.setup();
    setup();
    openButton().focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows the notice (and no enlarge button) when the picture cannot load", () => {
    setup();
    fireEvent.error(screen.getByRole("img", { name: `${TITLE} illustration` }));
    expect(screen.getByRole("status")).toHaveTextContent("Image couldn't be loaded");
    expect(screen.queryByRole("button", { name: /full size/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("tries again with a new link after a failure", () => {
    const { rerender } = render(<EquationImage src="https://cdn/old.png" title={TITLE} />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<EquationImage src="https://cdn/new.png" title={TITLE} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn/new.png");
  });

  it("gives every viewer its own title id", async () => {
    const user = userEvent.setup();
    render(
      <>
        <EquationImage src={SRC} title="First" />
        <EquationImage src={SRC} title="Second" />
      </>
    );
    await user.click(screen.getByRole("button", { name: "View Second illustration full size" }));
    expect(screen.getByRole("dialog", { name: "Second" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "First" })).not.toBeInTheDocument();
  });
});
