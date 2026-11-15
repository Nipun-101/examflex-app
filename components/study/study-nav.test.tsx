import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudyNav } from "@/components/study/study-nav";

const usePathname = vi.fn(() => "/today");

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
}));

describe("StudyNav", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/today");
  });

  it("renders study destinations, Analysis, and Profile", () => {
    render(<StudyNav />);

    expect(screen.getByRole("navigation", { name: "Study" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Mocks" })).toHaveAttribute(
      "href",
      "/mocks"
    );
    expect(screen.getByRole("link", { name: "Equation Book" })).toHaveAttribute(
      "href",
      "/equation-book"
    );
    expect(screen.getByRole("link", { name: "Mistake Book" })).toHaveAttribute(
      "href",
      "/mistake-book"
    );
    expect(screen.getByRole("link", { name: "Analysis" })).toHaveAttribute(
      "href",
      "/analysis"
    );
    expect(screen.queryByText("Colleges")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Profile/i })).toHaveAttribute(
      "href",
      "/profile"
    );
  });

  it("toggles the mobile menu and closes after a destination is chosen", async () => {
    const user = userEvent.setup();
    usePathname.mockReturnValue("/analysis");
    render(<StudyNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const mobileNav = screen.getByRole("navigation", { name: "Study mobile" });
    expect(
      within(mobileNav).getByRole("link", { name: "Analysis" })
    ).toHaveAttribute("aria-current", "page");

    await user.click(within(mobileNav).getByRole("link", { name: "Mocks" }));
    expect(
      screen.queryByRole("navigation", { name: "Study mobile" })
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu via the close control", async () => {
    const user = userEvent.setup();
    render(<StudyNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close menu" }));

    expect(
      screen.queryByRole("navigation", { name: "Study mobile" })
    ).not.toBeInTheDocument();
  });
});
