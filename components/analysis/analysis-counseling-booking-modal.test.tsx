import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import type { CounselingPrefill } from "@/types/counseling";
import { AnalysisCounselingBookingModal } from "./analysis-counseling-booking-modal";

vi.mock("@/lib/api/counseling", () => ({
  createCounselingRequest: vi.fn(),
}));

import { createCounselingRequest } from "@/lib/api/counseling";

const create = vi.mocked(createCounselingRequest);

const prefill: CounselingPrefill = {
  studentName: "Riya Sharma",
  email: "riya@example.com",
  phone: "9876543210",
  state: "Maharashtra",
  courseInterestedIn: "NEET UG",
  expectedMark: "548 out of 720",
  latestMockScore: 548,
  latestMockMaxScore: 720,
};

function renderModal(
  overrides: Partial<
    ComponentProps<typeof AnalysisCounselingBookingModal>
  > = {}
) {
  const onClose = vi.fn();
  const onBooked = vi.fn();
  render(
    <StudyLoadingProvider>
      <AnalysisCounselingBookingModal
        open
        onClose={onClose}
        examName="NEET UG"
        prefill={prefill}
        onBooked={onBooked}
        {...overrides}
      />
    </StudyLoadingProvider>
  );
  return { onClose, onBooked };
}

describe("AnalysisCounselingBookingModal", () => {
  beforeEach(() => {
    create.mockReset();
  });

  it("validates that a contact channel is required", async () => {
    const user = userEvent.setup();
    renderModal();

    const emailCheckbox = screen.getByRole("checkbox", { name: /Email/i });
    const phoneCheckbox = screen.getByRole("checkbox", { name: /Phone/i });
    await user.click(emailCheckbox);
    await user.click(phoneCheckbox);
    await user.click(
      screen.getByRole("button", { name: /Request my slot/i })
    );

    expect(
      await screen.findByText(/Pick email and\/or phone/i)
    ).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
  });

  it("submits a valid booking", async () => {
    const user = userEvent.setup();
    create.mockResolvedValue({ ok: true, data: { id: "r1" } });
    const { onBooked, onClose } = renderModal();

    await user.click(
      screen.getByRole("button", { name: /Request my slot/i })
    );

    await waitFor(() => {
      expect(create).toHaveBeenCalled();
    });
    expect(onBooked).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
