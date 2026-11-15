import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfilePage from "@/app/(app)/profile/page";

describe("ProfilePage", () => {
  it("renders the profile desk", () => {
    render(<ProfilePage />);

    expect(
      screen.getByRole("heading", { name: "Your desk" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });
});
