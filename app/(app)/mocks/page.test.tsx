import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MocksPage from "@/app/(app)/mocks/page";

describe("MocksPage", () => {
  it("renders the mocks placeholder", () => {
    render(<MocksPage />);

    expect(screen.getByRole("heading", { name: "Mocks" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Today" })).toBeInTheDocument();
  });
});
