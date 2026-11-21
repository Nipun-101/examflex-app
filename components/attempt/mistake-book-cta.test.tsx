import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookCta } from "@/components/attempt/mistake-book-cta";

describe("MistakeBookCta", () => {
  it("shows how many questions were saved and links to this paper's Mistake Book", () => {
    render(<MistakeBookCta mockTestId="mock-1" mistakeCount={7} />);
    expect(screen.getByRole("complementary", { name: "Mistake Book" })).toBeInTheDocument();
    expect(screen.getByText("7 questions saved from this test")).toBeInTheDocument();
    expect(
      screen.getByText(/Wrong and skipped answers are waiting for a calm second look/)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review mistakes" })).toHaveAttribute(
      "href",
      "/mistake-book/mock-1"
    );
  });

  it("uses the singular for one question", () => {
    render(<MistakeBookCta mockTestId="mock-1" mistakeCount={1} />);
    expect(screen.getByText("1 question saved from this test")).toBeInTheDocument();
  });

  it("encodes the paper id in the link", () => {
    render(<MistakeBookCta mockTestId="a/b c" mistakeCount={2} />);
    expect(screen.getByRole("link", { name: "Review mistakes" })).toHaveAttribute(
      "href",
      "/mistake-book/a%2Fb%20c"
    );
  });

  it("renders nothing when the paper id is unknown (nowhere to link)", () => {
    const { container } = render(
      <MistakeBookCta mockTestId={undefined} mistakeCount={5} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a link-free note instead of a button when there are no mistakes", () => {
    render(<MistakeBookCta mockTestId="mock-1" mistakeCount={0} />);
    expect(screen.getByText("Clean sheet.")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("lays out for mobile, tablet and desktop", () => {
    render(<MistakeBookCta mockTestId="mock-1" mistakeCount={3} />);
    const card = screen.getByRole("complementary", { name: "Mistake Book" });
    // mobile: stacked; tablet: text beside the button; desktop sidebar: stacked again
    expect(card).toHaveClass("flex-col", "sm:flex-row", "lg:flex-col");
    // full-width tap target on mobile, natural width on tablet, full width in the sidebar
    expect(screen.getByRole("link", { name: "Review mistakes" })).toHaveClass(
      "w-full",
      "sm:w-auto",
      "lg:w-full",
      "h-11"
    );
  });
});
