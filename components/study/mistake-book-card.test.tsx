import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookCard } from "@/components/study/mistake-book-card";
import { TODAY_EMPTY_SEED } from "@/lib/today/static-data";

describe("MistakeBookCard", () => {
  it("promotes Mistake Book with empty-state creative copy", () => {
    render(<MistakeBookCard data={TODAY_EMPTY_SEED.mistakeBook} />);

    expect(
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Open Mistake Book/i })
    ).toHaveAttribute("href", "/mistake-book");
    expect(screen.getByText(/Fills in after your first mock/i)).toBeInTheDocument();
  });
});
