import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ProfileView } from "@/components/profile/profile-view";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

describe("ProfileView", () => {
  it("renders the desk layout with OTP monogram", () => {
    render(<ProfileView data={PROFILE_PAGE_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Your desk" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Aarav Mehta" })
    ).toBeInTheDocument();
    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toHaveValue("Aarav Mehta");
    expect(screen.getByText("Prep pulse")).toBeInTheDocument();
    expect(screen.queryByLabelText(/photo/i)).not.toBeInTheDocument();
  });

  it("shows a Google profile photo for Google sessions", () => {
    const { container } = render(
      <ProfileView
        data={{
          ...PROFILE_PAGE_DATA,
          user: {
            ...PROFILE_PAGE_DATA.user,
            signInMethod: "google",
            avatarUrl: "https://lh3.googleusercontent.com/a/photo",
          },
        }}
      />
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://lh3.googleusercontent.com/a/photo"
    );
    expect(screen.queryByText("AM")).not.toBeInTheDocument();
  });

  it("ignores avatar urls on OTP sessions", () => {
    const { container } = render(
      <ProfileView
        data={{
          ...PROFILE_PAGE_DATA,
          user: {
            ...PROFILE_PAGE_DATA.user,
            signInMethod: "otp",
            avatarUrl: "https://lh3.googleusercontent.com/a/photo",
          },
        }}
      />
    );

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  it("validates, saves, and resets contact details", async () => {
    const user = userEvent.setup();
    render(<ProfileView data={PROFILE_PAGE_DATA} />);

    const nameInput = screen.getByLabelText("Full name");
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Add your name.");

    await user.type(nameInput, "Riya Sharma");
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Saved on this device."
    );
    expect(
      screen.getByRole("heading", { name: "Riya Sharma" })
    ).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, "Temp Name");
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(nameInput).toHaveValue("Riya Sharma");
  });

  it("clears a field error on edit", async () => {
    const user = userEvent.setup();
    render(<ProfileView data={PROFILE_PAGE_DATA} />);

    await user.clear(screen.getByLabelText("Email"));
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Add an email address.");

    await user.type(screen.getByLabelText("Email"), "riya@example.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
