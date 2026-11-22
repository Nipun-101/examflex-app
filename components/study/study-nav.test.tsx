import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudyNav } from "@/components/study/study-nav";

const usePathname = vi.fn(() => "/today");
const logout = vi.fn();
const getMyProfile = vi.fn();

vi.mock("@/lib/api/users", () => ({
  getMyProfile: (...args: unknown[]) => getMyProfile(...args),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => usePathname(),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/auth/tokens", () => ({
  logout: (...args: unknown[]) => logout(...args),
}));

describe("StudyNav", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/today");
    logout.mockReset();
    getMyProfile.mockReset();
    getMyProfile.mockResolvedValue({ ok: false, message: "x" });
  });

  it("shows the signed-in user's name on the profile link", async () => {
    getMyProfile.mockResolvedValue({
      ok: true,
      data: { name: "Asha Verma" },
    });
    render(<StudyNav />);

    const link = await screen.findByRole("link", { name: /Asha Verma/ });
    expect(link).toHaveAttribute("href", "/profile");
    expect(screen.getByTitle("Asha Verma")).toBeInTheDocument();
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

  it("logs out from the desktop control", async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    render(<StudyNav />);

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it("logs out from the mobile menu", async () => {
    const user = userEvent.setup();
    logout.mockResolvedValue(undefined);
    render(<StudyNav />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const mobileNav = screen.getByRole("navigation", { name: "Study mobile" });
    await user.click(within(mobileNav).getByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalled();
  });
});
