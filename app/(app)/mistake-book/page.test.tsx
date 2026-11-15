import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MistakeBookPage from "@/app/(app)/mistake-book/page";

describe("MistakeBookPage", () => {
  it("renders the Mistake Book review experience", () => {
    render(<MistakeBookPage />);

    expect(
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/rough incline/i).length).toBeGreaterThan(0);
    expect(
      screen.getByRole("button", { name: /Understood · remove from book/i })
    ).toBeInTheDocument();
  });
});
