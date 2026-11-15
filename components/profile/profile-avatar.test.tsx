import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfileAvatar } from "@/components/profile/profile-avatar";

describe("ProfileAvatar", () => {
  it("renders initials when no photo is set", () => {
    const { container } = render(
      <ProfileAvatar name="Aarav Mehta" avatarUrl={null} />
    );

    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders an image when a Google photo url is present", () => {
    const { container } = render(
      <ProfileAvatar
        name="Aarav Mehta"
        avatarUrl="https://lh3.googleusercontent.com/a/photo"
        size="lg"
      />
    );

    const image = container.querySelector("img");
    expect(image).toHaveAttribute(
      "src",
      "https://lh3.googleusercontent.com/a/photo"
    );
    expect(screen.queryByText("AM")).not.toBeInTheDocument();
  });
});
