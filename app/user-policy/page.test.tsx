import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import UserPolicyPage from "@/app/user-policy/page";

describe("UserPolicyPage", () => {
  it("renders acceptable use rules", () => {
    render(<UserPolicyPage />);

    expect(
      screen.getByRole("heading", { name: "User Policy" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Content you must not post or share" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How we enforce this policy" })
    ).toBeInTheDocument();
  });
});
