import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileIdentityCard } from "@/components/profile/profile-identity-card";

describe("ProfileIdentityCard", () => {
  it("shows identity copy without a photo control", () => {
    render(
      <ProfileIdentityCard
        name="Aarav Mehta"
        examTrack="ExamFlex"
        memberSinceLabel="On ExamFlex since March 2025"
        avatarUrl={null}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Aarav Mehta" })
    ).toBeInTheDocument();
    expect(screen.getByText("ExamFlex")).toBeInTheDocument();
    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.queryByLabelText(/photo/i)).not.toBeInTheDocument();
  });

  it("falls back to Your name when the draft name is blank", () => {
    render(
      <ProfileIdentityCard
        name="   "
        examTrack="ExamFlex"
        memberSinceLabel="On ExamFlex since March 2025"
        avatarUrl={null}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Your name" })
    ).toBeInTheDocument();
  });

  it("renders a Google profile photo when provided", () => {
    const { container } = render(
      <ProfileIdentityCard
        name="Aarav Mehta"
        examTrack="ExamFlex"
        memberSinceLabel="On ExamFlex since March 2025"
        avatarUrl="https://lh3.googleusercontent.com/a/photo"
      />
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://lh3.googleusercontent.com/a/photo"
    );
  });
});
