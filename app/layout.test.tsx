import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata, viewport } from "@/app/layout";

describe("RootLayout", () => {
  it("exports ExamFlex metadata and viewport", () => {
    expect(metadata.applicationName).toBe("ExamFlex");
    expect(String(metadata.description).toLowerCase()).toContain("neet");
    expect(metadata.manifest).toBe("/site.webmanifest");
    expect(metadata.icons).toEqual({
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    });
    expect(viewport.themeColor).toBe("#1a4d42");
    expect(viewport.viewportFit).toBe("cover");

    const title = metadata.title;
    expect(title).toBeTruthy();
    if (title && typeof title === "object" && "default" in title) {
      expect(title.default).toContain("ExamFlex");
      expect(title.template).toContain("ExamFlex");
    }
  });

  it("wraps children in the document shell", () => {
    render(
      RootLayout({
        children: <div>Child content</div> as ReactNode,
      } as Parameters<typeof RootLayout>[0])
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
