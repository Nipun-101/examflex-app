import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfileTargetExamCard } from "@/components/profile/profile-target-exam-card";

describe("ProfileTargetExamCard", () => {
  it("shows the current exam and edit action", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <ProfileTargetExamCard examName="NEET UG" hasExam onEdit={onEdit} />
    );

    expect(
      screen.getByRole("heading", { name: "NEET UG" })
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Change exam/i }));
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it("prompts to choose when unset", () => {
    render(
      <ProfileTargetExamCard
        examName="ExamFlex"
        hasExam={false}
        onEdit={vi.fn()}
      />
    );
    expect(
      screen.getByRole("heading", { name: "Not set yet" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Choose exam/i })
    ).toBeInTheDocument();
  });
});
