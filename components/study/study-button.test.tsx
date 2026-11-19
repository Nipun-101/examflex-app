import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  StudyButton,
  StudyControlLink,
} from "@/components/study/study-button";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

describe("StudyButton", () => {
  it("renders a surface control and handles clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <StudyButton variant="surface" onClick={onClick}>
        Next
      </StudyButton>
    );

    const button = screen.getByRole("button", { name: "Next" });
    expect(button).toHaveClass("cursor-pointer");
    expect(button).toHaveClass("hover:bg-study-mint");

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("defaults to the surface variant", () => {
    render(<StudyButton>Save</StudyButton>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveClass(
      "border-study-divider"
    );
  });
});

describe("StudyControlLink", () => {
  it("applies shared control styles to links", () => {
    render(
      <StudyControlLink href="/mocks" variant="solid">
        Take mock
      </StudyControlLink>
    );

    const link = screen.getByRole("link", { name: "Take mock" });
    expect(link).toHaveAttribute("href", "/mocks");
    expect(link).toHaveClass("cursor-pointer");
    expect(link).toHaveClass("bg-study-green");
  });

  it("forwards optional aria and click handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <StudyControlLink
        href="/profile"
        aria-current="page"
        aria-label="Open profile"
        onClick={onClick}
      >
        Profile
      </StudyControlLink>
    );

    const link = screen.getByRole("link", { name: "Open profile" });
    expect(link).toHaveAttribute("aria-current", "page");
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

