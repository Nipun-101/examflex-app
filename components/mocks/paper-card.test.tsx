import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaperCard } from "@/components/mocks/paper-card";
import type { PaperCardData } from "@/lib/mocks/paper-card-model";

const base: PaperCardData = {
  id: "p1",
  title: "Kinematics",
  subtitle: "Physics",
  totalQuestions: 20,
  durationInMinutes: 30,
  marksPerQuestion: 4,
  negativeMarking: 1,
};

const denied = { allowed: false, reason: "ENTITLEMENT_REQUIRED" };

describe("PaperCard", () => {
  it("shows paper meta", () => {
    render(<PaperCard paper={base} />);
    expect(
      screen.getByRole("heading", { name: "Kinematics" })
    ).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
    expect(screen.getByText("20 questions")).toBeInTheDocument();
    expect(screen.getByText("30 mins")).toBeInTheDocument();
    expect(screen.getByText("4 marks/Q")).toBeInTheDocument();
    expect(screen.getByText("−1 marking")).toBeInTheDocument();
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
  });

  it("shows no negative marking and omits a missing subtitle", () => {
    render(<PaperCard paper={{ ...base, subtitle: null, negativeMarking: 0 }} />);
    expect(screen.getByText("No negative marking")).toBeInTheDocument();
    expect(screen.queryByText("Physics")).not.toBeInTheDocument();
  });

  it("starts the paper", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<PaperCard paper={base} onLaunch={onLaunch} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("offers Retake as a start", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(
      <PaperCard
        paper={{ ...base, userAttemptAction: "RETAKE" }}
        onLaunch={onLaunch}
      />
    );
    await user.click(screen.getByRole("button", { name: "Retake" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("does nothing on a plain click without handlers", async () => {
    const user = userEvent.setup();
    render(<PaperCard paper={base} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByRole("button", { name: "Start" })).toBeEnabled();
  });

  it("shows View plans and a Locked badge when start is blocked", async () => {
    const user = userEvent.setup();
    const onViewPlans = vi.fn();
    const onLaunch = vi.fn();
    render(
      <PaperCard
        paper={{ ...base, userAttemptAction: "START", access: denied }}
        onLaunch={onLaunch}
        onViewPlans={onViewPlans}
      />
    );
    expect(screen.getByText("Locked")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start" })).toBeNull();
    await user.click(screen.getByRole("button", { name: /View plans/i }));
    expect(onViewPlans).toHaveBeenCalledTimes(1);
    expect(onLaunch).not.toHaveBeenCalled();
  });

  it("blocked retake also shows View plans", () => {
    render(
      <PaperCard
        paper={{ ...base, userAttemptAction: "RETAKE", access: denied }}
      />
    );
    expect(
      screen.getByRole("button", { name: /View plans/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retake" })).toBeNull();
  });

  it("keeps Resume available when access is denied", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(
      <PaperCard
        paper={{
          ...base,
          userAttemptAction: "RESUME",
          resumeAttemptId: "a1",
          access: denied,
        }}
        onLaunch={onLaunch}
      />
    );
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("shows the busy label while acting", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          userAttemptAction: "RESUME",
          resumeAttemptId: "a1",
        }}
        isActing
      />
    );
    expect(screen.getByRole("button", { name: "Resuming..." })).toBeDisabled();
  });

  it("disables the action while another paper launches", () => {
    render(<PaperCard paper={base} disabled />);
    expect(screen.getByRole("button", { name: "Start" })).toBeDisabled();
  });
});
