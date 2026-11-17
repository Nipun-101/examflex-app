import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaperCard } from "@/components/mocks/paper-card";
import type { PaperCardData } from "@/lib/mocks/paper-card-model";

const base: PaperCardData = {
  id: "p1",
  title: "Kinematics",
  subtitle: "Physics · Kinematics",
  eyebrow: "PHYSICS · KINEMATICS",
  kind: "chapter",
  subjectName: "Physics",
  topicName: "Kinematics",
  totalQuestions: 20,
  durationInMinutes: 30,
  totalMarks: 80,
  marksPerQuestion: 4,
  negativeMarking: 1,
  allowRetake: true,
  status: "new",
  attemptCount: 0,
};

const denied = { allowed: false, reason: "ENTITLEMENT_REQUIRED" };

describe("PaperCard", () => {
  it("renders the new variant with stats and Start", () => {
    render(<PaperCard paper={base} />);
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("PHYSICS · KINEMATICS")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Kinematics" })
    ).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("−1 marking")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start" })).toBeInTheDocument();
  });

  it("shows no negative marking and omits marking chip text when zero", () => {
    render(<PaperCard paper={{ ...base, negativeMarking: 0 }} />);
    expect(screen.getByText("No negative marking")).toBeInTheDocument();
    expect(screen.queryByText("−0 marking")).not.toBeInTheDocument();
  });

  it("starts the paper", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(<PaperCard paper={base} onLaunch={onLaunch} />);
    await user.click(screen.getByRole("button", { name: "Start" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("renders in-progress progress + Resume", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(
      <PaperCard
        paper={{
          ...base,
          status: "in_progress",
          userAttemptAction: "RESUME",
          resumeAttemptId: "a1",
          answeredCount: 4,
          timeRemainingSeconds: 370,
        }}
        onLaunch={onLaunch}
      />
    );
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("4 of 20 answered")).toBeInTheDocument();
    expect(screen.getByText("6:10 left")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume →" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("keeps best-score history under a paused retake without Mistake Book", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          status: "in_progress",
          userAttemptAction: "RESUME",
          resumeAttemptId: "a-live",
          answeredCount: 3,
          timeRemainingSeconds: 500,
          attemptCount: 2,
          bestScore: 32,
          bestCorrectAnswers: 8,
          lastAttemptId: "a9",
          lastTimeTakenSeconds: 460,
          lastIncorrectAnswers: 3,
        }}
      />
    );
    expect(screen.getByText("In progress")).toBeInTheDocument();
    expect(screen.getByText("Best score · 2 attempts")).toBeInTheDocument();
    expect(screen.getByText("7:40 taken last time")).toBeInTheDocument();
    expect(screen.getByText("3 of 20 answered")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Mistake Book/i })
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resume →" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/mocks/attempt/a9/result"
    );
    expect(
      screen.getByText("Review opens your latest attempt")
    ).toBeInTheDocument();
  });

  it("renders completed Retry + Review and Mistake Book strip", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          status: "completed",
          userAttemptAction: "RETAKE",
          attemptCount: 2,
          bestScore: 32,
          bestCorrectAnswers: 8,
          lastAttemptId: "a9",
          lastTimeTakenSeconds: 460,
          lastIncorrectAnswers: 3,
          mistakeBookRemaining: 4,
        }}
      />
    );
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Best score · 2 attempts")).toBeInTheDocument();
    expect(screen.getByText("7:40 taken last time")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Best score 8 out of 20" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /4 mistakes waiting in your Mistake Book/i,
      })
    ).toHaveAttribute("href", "/mistake-book/p1");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/mocks/attempt/a9/result"
    );
    expect(
      screen.getByText("Review opens your latest attempt")
    ).toBeInTheDocument();
  });

  it("hides Retry when retakes are disabled", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          status: "completed",
          userAttemptAction: "RETAKE",
          allowRetake: false,
          lastAttemptId: "a9",
          attemptCount: 1,
          bestCorrectAnswers: 8,
        }}
      />
    );
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
    expect(screen.getByRole("link", { name: "Review" })).toBeInTheDocument();
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

  it("blocked retry also shows View plans", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          status: "completed",
          userAttemptAction: "RETAKE",
          access: denied,
          lastAttemptId: "a9",
          attemptCount: 1,
        }}
      />
    );
    expect(
      screen.getByRole("button", { name: /View plans/i })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });

  it("keeps Resume available when access is denied", async () => {
    const user = userEvent.setup();
    const onLaunch = vi.fn();
    render(
      <PaperCard
        paper={{
          ...base,
          status: "in_progress",
          userAttemptAction: "RESUME",
          resumeAttemptId: "a1",
          access: denied,
          answeredCount: 1,
          timeRemainingSeconds: 100,
        }}
        onLaunch={onLaunch}
      />
    );
    expect(screen.queryByText("Locked")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume →" }));
    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("shows the busy label while acting", () => {
    render(
      <PaperCard
        paper={{
          ...base,
          status: "in_progress",
          userAttemptAction: "RESUME",
          resumeAttemptId: "a1",
          answeredCount: 1,
          timeRemainingSeconds: 100,
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
