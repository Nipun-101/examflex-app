import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TodayPage from "@/app/(app)/today/page";

describe("TodayPage", () => {
  it("renders the static Today dashboard", () => {
    render(<TodayPage />);

    expect(
      screen.getByRole("heading", { name: "One good step at a time." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Mistake Book/i })
    ).toBeInTheDocument();
  });
});
