import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/layout/site-header";

describe("SiteHeader", () => {
  it("renders the app name and exam labels", () => {
    render(<SiteHeader />);

    expect(screen.getByText("ExamFlex")).toBeInTheDocument();
    expect(screen.getByText("NEET · JEE")).toBeInTheDocument();
  });
});
