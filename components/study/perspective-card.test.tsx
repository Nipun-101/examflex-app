import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PerspectiveCard } from "@/components/study/perspective-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("PerspectiveCard", () => {
  it("links into Analysis instead of Colleges", () => {
    render(<PerspectiveCard data={TODAY_PAGE_DATA.perspective} />);

    expect(
      screen.getByRole("heading", { name: "See where you could go." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Analysis/i })
    ).toHaveAttribute("href", "/analysis");
    expect(screen.queryByText(/colleges/i)).not.toBeInTheDocument();
  });

  it("accepts a layout className for stretched desktop columns", () => {
    const { container } = render(
      <PerspectiveCard
        data={TODAY_PAGE_DATA.perspective}
        className="lg:flex-1"
      />
    );

    expect(container.firstElementChild).toHaveClass("lg:flex-1");
  });
});

