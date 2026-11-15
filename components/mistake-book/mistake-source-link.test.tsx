import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeSourceLink } from "@/components/mistake-book/mistake-source-link";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

describe("MistakeSourceLink", () => {
  it("links to the matched NCERT source", () => {
    const mistake = MISTAKE_BOOK_DATA.mistakes[0]!;
    render(<MistakeSourceLink mistake={mistake} />);

    expect(
      screen.getByRole("link", { name: /NCERT XI · Laws of motion · Friction/i })
    ).toHaveAttribute("href", mistake.sourceHref);
    expect(screen.getByText(mistake.sourceHint)).toBeInTheDocument();
  });
});
