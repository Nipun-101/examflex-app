import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
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

  it("can load eagerly for content that is needed immediately", () => {
    render(<AttemptImage src="a.png" alt="A" loading="eager" />);
    expect(screen.getByRole("img", { name: "A" })).toHaveAttribute("loading", "eager");
  });

  it("shows a visible notice instead of a blank gap when the URL fails to load", () => {
    render(<AttemptImage src="https://cdn/expired.png" alt="Diagram" className="mt-2" />);
    fireEvent.error(screen.getByRole("img", { name: "Diagram" }));
    expect(screen.queryByRole("img", { name: "Diagram" })).not.toBeInTheDocument();
    const notice = screen.getByRole("status");
    expect(notice).toHaveTextContent("Image couldn't be loaded");
    expect(notice.className).toContain("mt-2");
  });

  it("tries again when given a new URL after a failure (e.g. a refreshed link)", () => {
    const { rerender } = render(<AttemptImage src="https://cdn/old.png" alt="Diagram" />);
    fireEvent.error(screen.getByRole("img", { name: "Diagram" }));
    expect(screen.getByRole("status")).toBeInTheDocument();

    rerender(<AttemptImage src="https://cdn/new.png" alt="Diagram" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute(
      "src",
      "https://cdn/new.png"
    );
  });

  it("tells a wrapper when the picture fails to load", () => {
    const onLoadError = vi.fn();
    render(<AttemptImage src="https://cdn/bad.png" alt="Diagram" onLoadError={onLoadError} />);
    fireEvent.error(screen.getByRole("img", { name: "Diagram" }));
    expect(onLoadError).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("works without a callback", () => {
    render(<AttemptImage src="https://cdn/bad.png" alt="Diagram" />);
    expect(() =>
      fireEvent.error(screen.getByRole("img", { name: "Diagram" }))
    ).not.toThrow();
  });
});

