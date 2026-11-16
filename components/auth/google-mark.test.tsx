import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoogleMark } from "@/components/auth/google-mark";

describe("GoogleMark", () => {
  it("renders an accessible decorative SVG at the requested size", () => {
    const { container } = render(<GoogleMark size={22} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "22");
    expect(svg).toHaveAttribute("height", "22");
  });
});
