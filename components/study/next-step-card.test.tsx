import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NextStepCard } from "@/components/study/next-step-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

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
});
