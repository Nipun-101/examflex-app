import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttemptImage } from "@/components/attempt/attempt-image";

describe("AttemptImage", () => {
  it("renders a lazy responsive image", () => {
    render(<AttemptImage src="https://cdn/x.png" alt="Diagram" className="mt-2" />);
    const image = screen.getByRole("img", { name: "Diagram" });
    expect(image).toHaveAttribute("src", "https://cdn/x.png");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image.className).toContain("mt-2");
  });

  it("works without extra classes", () => {
    render(<AttemptImage src="a.png" alt="A" />);
    expect(screen.getByRole("img", { name: "A" })).toBeInTheDocument();
  });
});
