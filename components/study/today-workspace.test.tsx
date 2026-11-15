import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TodayWorkspace } from "@/components/study/today-workspace";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

describe("TodayWorkspace", () => {
  it("composes both columns and omits the concept footer", () => {
    render(<TodayWorkspace data={TODAY_PAGE_DATA} />);

    expect(
      screen.getByRole("region", { name: "Study workspace" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Your mistakes have a next chapter.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your 20-minute reset" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "A score is a starting point." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Mock 12: 548 of 720" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/CONCEPT 01/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Illustrative data/)).toBeInTheDocument();
  });
});
