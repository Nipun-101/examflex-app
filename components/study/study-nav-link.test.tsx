import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StudyNavLink } from "@/components/study/study-nav-link";
import {
  StudyLoadingProvider,
  useStudyLoadingOverlay,
} from "@/components/study/study-loading-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

function OverlayProbe() {
  const loading = useStudyLoadingOverlay();
  return <p>{loading.isLoading ? "busy" : "idle"}</p>;
}

describe("StudyNavLink", () => {
  it("opens the shared overlay for in-app Soft Nav", async () => {
    const user = userEvent.setup();

    render(
      <StudyLoadingProvider>
        <OverlayProbe />
        <StudyNavLink href="/mocks">Open mocks</StudyNavLink>
      </StudyLoadingProvider>
    );

    expect(screen.getByText("idle")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Open mocks" }));
    expect(screen.getByText("busy")).toBeInTheDocument();
    expect(
      screen.getByRole("alertdialog", { name: "Loading your study space..." })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);
  });

  it("still navigates without a provider", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <StudyNavLink href="/mocks" onClick={onClick}>
        Open mocks
      </StudyNavLink>
    );

    await user.click(screen.getByRole("link", { name: "Open mocks" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
