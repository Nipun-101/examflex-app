import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import RootLayout, { metadata, viewport } from "@/app/layout";

describe("RootLayout", () => {
  it("exports ExamFlex metadata and viewport", () => {
    expect(metadata.applicationName).toBe("ExamFlex");
    expect(String(metadata.description).toLowerCase()).toContain("neet");
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
