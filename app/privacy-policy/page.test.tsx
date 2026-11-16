import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PrivacyPolicyPage from "@/app/privacy-policy/page";

describe("PrivacyPolicyPage", () => {
  it("renders Google sign-in and privacy sections", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByRole("heading", { name: "Privacy Policy" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /What ExamFlex receives from your Google account/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Information we collect" })
    ).toBeInTheDocument();
    expect(document.getElementById("payments")).toBeTruthy();
  });
});
