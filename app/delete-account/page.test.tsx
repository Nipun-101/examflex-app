import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import DeleteAccountPage from "@/app/delete-account/page";

describe("DeleteAccountPage", () => {
  it("explains how to request account deletion", () => {
    render(<DeleteAccountPage />);

    expect(
      screen.getByRole("heading", { name: /Delete your ExamFlex account/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Delete my ExamFlex account/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Google Sign-In" })
    ).toBeInTheDocument();
  });
});
