import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

vi.mock("@/components/auth/login-panel", () => ({
  LoginPanel: () => <div>Login panel</div>,
}));

describe("LoginPage", () => {
  it("renders marketing chrome around the login panel", () => {
    render(<LoginPage />);
    expect(screen.getByText("Login panel")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
