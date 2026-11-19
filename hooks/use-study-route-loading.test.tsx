import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  StudyLoadingProvider,
  useStudyLoadingOverlay,
} from "@/components/study/study-loading-provider";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { STUDY_LOADING_HOLD } from "@/lib/study/loading-holds";

vi.mock("next/navigation", () => ({
  usePathname: () => "/today",
  useSearchParams: () => new URLSearchParams(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <StudyLoadingProvider>{children}</StudyLoadingProvider>;
}

function SoftNavThenRoute({ routeBusy }: { routeBusy: boolean }) {
  const loading = useStudyLoadingOverlay();
  return (
    <>
      <button
        type="button"
        onClick={() =>
          loading.hold(STUDY_LOADING_HOLD.softNav, {
            label: "Loading your study space...",
          })
        }
      >
        Soft Nav
      </button>
      <button
        type="button"
        onClick={() => loading.release(STUDY_LOADING_HOLD.softNav)}
      >
        Release Soft Nav
      </button>
      <StudyRouteLoading busy={routeBusy} />
      <p>{loading.isLoading ? "busy" : "idle"}</p>
    </>
  );
}

describe("StudyRouteLoading hold handoff", () => {
  it("keeps a single overlay when Soft Nav hands off to route boot", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SoftNavThenRoute routeBusy={false} />, {
      wrapper,
    });

    await user.click(screen.getByRole("button", { name: "Soft Nav" }));
    expect(screen.getByText("busy")).toBeInTheDocument();
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);

    await act(async () => {
      rerender(<SoftNavThenRoute routeBusy />);
    });
    expect(screen.getByText("busy")).toBeInTheDocument();
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: "Release Soft Nav" }));
    expect(screen.getByText("busy")).toBeInTheDocument();
    expect(screen.getAllByRole("alertdialog")).toHaveLength(1);

    await act(async () => {
      rerender(<SoftNavThenRoute routeBusy={false} />);
    });
    expect(screen.getByText("idle")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
