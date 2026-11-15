import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NextMockCard } from "@/components/study/next-mock-card";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("NextMockCard", () => {
  it("links into the mocks placeholder route", () => {
    render(<NextMockCard data={TODAY_PAGE_DATA.nextMock} />);

    expect(
      screen.getByRole("heading", { name: "NEET full-syllabus mock" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View mocks/i })).toHaveAttribute(
      "href",
      "/mocks"
    );
  });
});
