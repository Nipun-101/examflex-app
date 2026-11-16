import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import HomePage from "@/app/page";

vi.mock("@/app/home-content", () => ({
  HomeContent: () => <div>Resolved home content</div>,
}));

describe("HomePage", () => {
  it("streams home content behind Suspense with a marketing fallback shell", () => {
    render(<HomePage searchParams={Promise.resolve({})} />);

    expect(screen.getByText("Resolved home content")).toBeInTheDocument();
  });
});
