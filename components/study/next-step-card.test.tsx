import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextStepCard } from "@/components/study/next-step-card";
import { TODAY_EMPTY_SEED, TODAY_PAGE_DATA } from "@/lib/today/static-data";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

describe("NextStepCard", () => {
  it("links to the mistake book", () => {
    render(<NextStepCard data={TODAY_PAGE_DATA.nextStep} />);

    expect(
      screen.getByRole("heading", {
        name: "Your mistakes have a next chapter.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Mistake Book/i })
    ).toHaveAttribute("href", "/mistake-book");
  });

  it("shows the start-here path for empty users", () => {
    const { container } = render(
      <NextStepCard data={TODAY_EMPTY_SEED.nextStep} />
    );

    expect(
      screen.getByRole("heading", { name: "Your first step is a quick revision." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Equation Book/i })
    ).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
