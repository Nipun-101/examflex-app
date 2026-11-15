import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  StudyLoadingProvider,
  useStudyLoadingOverlay,
} from "@/components/study/study-loading-provider";

function Probe() {
  const loading = useStudyLoadingOverlay();

  return (
    <div>
      <p>{loading.isLoading ? "busy" : "idle"}</p>
      <button
        type="button"
        onClick={() => loading.show({ label: "Saving progress" })}
      >
        Show
      </button>
      <button type="button" onClick={() => loading.hide()}>
        Hide
      </button>
      <button
        type="button"
        onClick={() =>
          void loading.run(async () => "done", { label: "Running" })
        }
      >
        Run
      </button>
    </div>
  );
}

describe("StudyLoadingProvider", () => {
  it("throws when the overlay hook is used without a provider", () => {
    expect(() => render(<Probe />)).toThrow(
      /useStudyLoadingOverlay must be used within StudyLoadingProvider/
    );
  });

  it("shows and hides the shared viewport overlay", async () => {
    const user = userEvent.setup();

    render(
      <StudyLoadingProvider>
        <Probe />
      </StudyLoadingProvider>
    );

    expect(screen.getByText("idle")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(
      screen.getByRole("alertdialog", { name: "Saving progress" })
    ).toBeInTheDocument();
    expect(screen.getByText("busy")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Hide" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("runs work through the shared controller", async () => {
    const user = userEvent.setup();

    render(
      <StudyLoadingProvider defaultLabel="Working">
        <Probe />
      </StudyLoadingProvider>
    );

    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("falls back to the provider default label", async () => {
    const user = userEvent.setup();

    function DefaultProbe() {
      const loading = useStudyLoadingOverlay();
      return (
        <button type="button" onClick={() => loading.show()}>
          Show default
        </button>
      );
    }

    render(
      <StudyLoadingProvider defaultLabel="Hold tight">
        <DefaultProbe />
      </StudyLoadingProvider>
    );

    await user.click(screen.getByRole("button", { name: "Show default" }));
    expect(
      screen.getByRole("alertdialog", { name: "Hold tight" })
    ).toBeInTheDocument();
  });
});

