import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlaceholderPage } from "@/components/study/placeholder-page";

describe("PlaceholderPage", () => {
  it("renders title, description, and a back link to Today", () => {
    render(
      <PlaceholderPage
        title="Mocks"
        description="Placeholder copy for mocks."
      />
    );

    expect(
      screen.getByRole("heading", { name: "Mocks" })
    ).toBeInTheDocument();
    expect(screen.getByText("Placeholder copy for mocks.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Today" })).toHaveAttribute(
      "href",
      "/today"
    );
  });
});
