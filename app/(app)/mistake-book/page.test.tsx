import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MistakeBookPage from "@/app/(app)/mistake-book/page";

describe("MistakeBookPage", () => {
  it("renders the mistake book placeholder", () => {
    render(<MistakeBookPage />);

    expect(
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
  });
});
