import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LandingHeader } from "@/components/landing/landing-header";

describe("LandingHeader", () => {
  it("renders brand, desktop nav, and auth actions", () => {
    render(<LandingHeader />);

    expect(screen.getByText("Exam")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up free" })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("toggles the mobile menu open and closed", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    const mobileNav = screen.getByRole("navigation", { name: "Mobile" });
    expect(mobileNav).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();

    await user.click(within(mobileNav).getByRole("link", { name: "Mocks" }));
    expect(
      screen.queryByRole("navigation", { name: "Mobile" })
    ).not.toBeInTheDocument();
  });

  it("closes the mobile menu from auth actions and brand link", async () => {
    const user = userEvent.setup();
    render(<LandingHeader />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const mobilePanel = screen.getByRole("navigation", { name: "Mobile" })
      .parentElement;
    expect(mobilePanel).not.toBeNull();
    await user.click(
      within(mobilePanel as HTMLElement).getByRole("link", { name: "Log in" })
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const signupPanel = screen.getByRole("navigation", { name: "Mobile" })
      .parentElement;
    expect(signupPanel).not.toBeNull();
    await user.click(
      within(signupPanel as HTMLElement).getByRole("link", {
        name: "Sign up free",
      })
    );
    expect(
      screen.queryByRole("navigation", { name: "Mobile" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("link", { name: /Exam\s*Flex/i }));
    expect(
      screen.queryByRole("navigation", { name: "Mobile" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(
      screen.queryByRole("navigation", { name: "Mobile" })
    ).not.toBeInTheDocument();
  });
});

