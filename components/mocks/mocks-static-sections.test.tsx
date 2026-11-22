import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MocksStaticSections } from "@/components/mocks/mocks-static-sections";

describe("MocksStaticSections", () => {
  it("renders three-ways, plan strip, and mobile sprint promo", () => {
    render(<MocksStaticSections />);
    expect(
      screen.getByRole("heading", { name: "Three ways to practise" })
    ).toBeInTheDocument();
    expect(screen.getByText("Full mocks")).toBeInTheDocument();
    expect(screen.getByText("Chapter-wise tests")).toBeInTheDocument();
    expect(screen.getByText("Sprint tests")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Know where you stand.",
      })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Sprint teaser")).toHaveTextContent(
      /Short on time/
    );
  });
});
