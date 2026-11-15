import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfilePage from "@/app/(app)/profile/page";

describe("ProfilePage", () => {
  it("renders the profile placeholder", () => {
    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: "Profile" })
    ).toBeInTheDocument();
  });
});
