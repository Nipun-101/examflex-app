import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthenticatedStudyArea } from "@/components/study/authenticated-study-area";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({
  requireSession: vi.fn(async () => ({
    user: { id: "session", displayName: "Student", exam: "NEET" },
  })),
}));

describe("AuthenticatedStudyArea", () => {
  it("requires a session then renders the study shell", async () => {
    const ui = await AuthenticatedStudyArea({
      children: <p>Protected child</p>,
    });

    render(ui);

    expect(screen.getByText("Protected child")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Study" })
    ).toBeInTheDocument();
  });
});
