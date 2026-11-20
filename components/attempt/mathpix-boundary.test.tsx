import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MathText } from "@/components/attempt/math-text";
import {
  MathpixBoundary,
  loadMathpix,
  preloadMathpix,
  resetMathpixCache,
} from "@/components/attempt/mathpix-boundary";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

const { loadMathJax } = vi.hoisted(() => ({ loadMathJax: vi.fn(() => true) }));

vi.mock("mathpix-markdown-it", () => mathpixModuleStub(loadMathJax));

beforeEach(() => {
  resetMathpixCache();
});

describe("loadMathpix", () => {
  it("injects the Mathpix styles once", async () => {
    loadMathJax.mockClear();
    await loadMathpix();
    await loadMathpix();
    expect(loadMathJax).toHaveBeenCalledTimes(1);
  });

  it("imports once and caches the module", async () => {
    const first = await loadMathpix();
    const second = await loadMathpix();
    expect(second).toBe(first);
    expect(await loadMathpix()).toBe(first);
  });
});

describe("MathpixBoundary + MathText", () => {
  it("renders plain text first, then upgrades to Mathpix", async () => {
    render(
      <MathpixBoundary>
        <MathText text="x^2" />
      </MathpixBoundary>
    );
    expect(screen.getByText("x^2")).toBeInTheDocument();
    expect(screen.queryByTestId("mathpix-markdown")).not.toBeInTheDocument();

    await act(async () => {
      await loadMathpix();
    });
    expect(await screen.findByTestId("mathpix-markdown")).toHaveTextContent("x^2");
  });

  it("does not remount children when the library arrives", async () => {
    render(
      <MathpixBoundary>
        <button type="button">stable</button>
      </MathpixBoundary>
    );
    const before = screen.getByRole("button", { name: "stable" });
    await act(async () => {
      await loadMathpix();
    });
    expect(screen.getByRole("button", { name: "stable" })).toBe(before);
  });

  it("renders Mathpix immediately when already loaded", async () => {
    await loadMathpix();
    render(
      <MathpixBoundary>
        <MathText text="y" inline className="extra" />
      </MathpixBoundary>
    );
    const node = await screen.findByTestId("mathpix-markdown");
    expect(node.parentElement?.className).toContain("mathpix-inline");
    expect(node.parentElement?.className).toContain("extra");
  });

  it("uses block styling by default", async () => {
    await loadMathpix();
    render(
      <MathpixBoundary>
        <MathText text="z" />
      </MathpixBoundary>
    );
    const node = await screen.findByTestId("mathpix-markdown");
    expect(node.parentElement?.className).toContain("mathpix-block");
  });

  it("keeps plain text when the module fails to load", async () => {
    vi.resetModules();
    vi.doMock("mathpix-markdown-it", () => {
      throw new Error("offline");
    });
    const boundary = await import("@/components/attempt/mathpix-boundary");
    const text = await import("@/components/attempt/math-text");
    boundary.resetMathpixCache();
    render(
      <boundary.MathpixBoundary>
        <text.MathText text="fallback" />
      </boundary.MathpixBoundary>
    );
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    expect(screen.getByText("fallback")).toBeInTheDocument();
    vi.doUnmock("mathpix-markdown-it");
  });
});

describe("MathText", () => {
  it("renders nothing for blank or missing text", () => {
    const { container, rerender } = render(<MathText text="   " />);
    expect(container).toBeEmptyDOMElement();
    rerender(<MathText text={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<MathText text={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("inlines plain text when asked", () => {
    render(<MathText text="plain" inline />);
    const node = screen.getByText("plain");
    expect(node.tagName).toBe("SPAN");
    expect(node.className).toContain("inline");
  });
});

describe("preloadMathpix", () => {
  it("warms the cache without a caller", async () => {
    preloadMathpix();
    const loaded = await loadMathpix();
    expect(loaded.MathpixMarkdownModel.loadMathJax).toBeTypeOf("function");
  });

  it("swallows a failed load", async () => {
    vi.resetModules();
    vi.doMock("mathpix-markdown-it", () => {
      throw new Error("offline");
    });
    const boundary = await import("@/components/attempt/mathpix-boundary");
    boundary.resetMathpixCache();
    expect(() => boundary.preloadMathpix()).not.toThrow();
    await new Promise((resolve) => setTimeout(resolve, 20));
    vi.doUnmock("mathpix-markdown-it");
  });
});
