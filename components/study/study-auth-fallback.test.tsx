import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StudyAuthFallback } from "@/components/study/study-auth-fallback";

describe("StudyAuthFallback", () => {
  it("exposes an accessible loading status for the study area", () => {
    render(<StudyAuthFallback />);
    expect(
      screen.getByRole("status", { name: "Loading study area" })
    ).toBeInTheDocument();
    expect(screen.getByText("Checking your session…")).toBeInTheDocument();
  });
});
