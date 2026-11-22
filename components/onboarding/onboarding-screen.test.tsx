import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import type { ApiUserProfile } from "@/types/user";

const verifyMyPhone = vi.fn();
const completeOnboarding = vi.fn();
const listShowInAppExams = vi.fn();
const logout = vi.fn();

vi.mock("@/lib/api/onboarding", () => ({
  verifyMyPhone: (...args: unknown[]) => verifyMyPhone(...args),
  completeOnboarding: (...args: unknown[]) => completeOnboarding(...args),
}));
vi.mock("@/lib/equation-book/list-show-in-app-exams", () => ({
  listShowInAppExams: () => listShowInAppExams(),
}));
vi.mock("@/lib/auth/tokens", () => ({ logout: () => logout() }));

let lastOutcome: unknown;
vi.mock("@/components/auth/mobile-otp-form", () => ({
  MobileOtpForm: ({
    onVerified,
    initialMobile,
  }: {
    onVerified: (t: string, m: string) => Promise<unknown>;
    initialMobile?: string;
  }) => (
    <div data-testid="otp-form" data-initial={initialMobile}>
      <button
        type="button"
        onClick={async () => {
          lastOutcome = await onVerified("msg91-token", "9876543210");
        }}
      >
        simulate verified code
      </button>
    </div>
  ),
}));

const EXAMS = [
  { id: "neet", name: "NEET" },
  { id: "jee", name: "JEE Main" },
];

function profile(over: Partial<ApiUserProfile> = {}): ApiUserProfile {
  return {
    id: "u1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    role: "user",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    phoneVerified: false,
    onboardingCompleted: false,
    profileComplete: false,
    ...over,
  };
}

const verified = (over: Partial<ApiUserProfile> = {}) =>
  profile({ phoneNumber: "+919876543210", phoneVerified: true, ...over });

function setup(p: ApiUserProfile) {
  const onProfileChange = vi.fn();
  const onComplete = vi.fn();
  const user = userEvent.setup();
  render(
    <OnboardingScreen
      profile={p}
      onProfileChange={onProfileChange}
      onComplete={onComplete}
    />
  );
  return { user, onProfileChange, onComplete };
}

describe("OnboardingScreen", () => {
  beforeEach(() => {
    [verifyMyPhone, completeOnboarding, listShowInAppExams, logout].forEach((f) =>
      f.mockReset()
    );
    listShowInAppExams.mockResolvedValue(EXAMS);
    lastOutcome = undefined;
  });
  afterEach(cleanup);

  describe("what each learner sees", () => {
    it("asks a Google learner to verify a mobile number, with their name prefilled", async () => {
      setup(profile());
      expect(await screen.findByRole("radio", { name: "NEET" })).toBeInTheDocument();
      expect(screen.getByLabelText("Your name")).toHaveValue("Rahul Sharma");
      expect(screen.getByTestId("otp-form")).toBeInTheDocument();
      expect(screen.queryByText("Verified")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
      expect(screen.getByText("Verify your mobile number to continue.")).toBeInTheDocument();
    });

    it("shows an OTP learner's number as already verified and asks for a blank name", async () => {
      setup(verified({ name: "User 3210" }));
      await screen.findByRole("radio", { name: "NEET" });
      expect(screen.getByText("+91 98765 43210")).toBeInTheDocument();
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(screen.queryByTestId("otp-form")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Your name")).toHaveValue("");
    });

    it("prefills an old, unverified number so it only needs confirming", async () => {
      setup(profile({ phoneNumber: "+919123456789" }));
      expect(await screen.findByTestId("otp-form")).toHaveAttribute(
        "data-initial",
        "9123456789"
      );
    });

    it("keeps an existing target exam selected", async () => {
      setup(verified({ targetExam: { id: "jee", name: "JEE Main" } }));
      const jee = await screen.findByRole("radio", { name: "JEE Main" });
      expect(jee).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("radio", { name: "NEET" })).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("name", () => {
    it("shows a problem only after the learner leaves the field", async () => {
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.type(input, "R@hul");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      await user.tab();
      expect(await screen.findByRole("alert")).toHaveTextContent(/letters, numbers, spaces/i);
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it.each([
      ["", /Add your name/],
      ["A", /at least 2 characters/],
      ["Rahul 🚀", /letters, numbers, spaces/],
    ])("rejects %j", async (value, message) => {
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      if (value) await user.type(input, value);
      await user.tab();
      expect(await screen.findByRole("alert")).toHaveTextContent(message);
    });

    it.each([["Rahul K."], ["José García"], ["李雷"], ["McDonald"]])(
      "accepts the Google-style name %j without complaint",
      async (value) => {
        const { user } = setup(verified());
        const input = await screen.findByLabelText("Your name");
        await user.clear(input);
        await user.type(input, value);
        await user.tab();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        expect(input).not.toHaveAttribute("aria-invalid");
      }
    );

    it("cleans invisible characters out of a pasted name when the learner leaves the field", async () => {
      const ZWSP = String.fromCodePoint(0x200b);
      const RLO = String.fromCodePoint(0x202e);
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.click(input);
      await user.paste(`${RLO}Ra${ZWSP}hul   Sharma`);
      await user.tab();
      expect(input).toHaveValue("Rahul Sharma");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("sends the cleaned name, never the raw pasted one", async () => {
      const ZWSP = String.fromCodePoint(0x200b);
      completeOnboarding.mockResolvedValue({ ok: true, data: verified({ profileComplete: true }) });
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.click(input);
      await user.paste(`Ra${ZWSP}hul`);
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));
      await waitFor(() => expect(completeOnboarding).toHaveBeenCalled());
      expect(completeOnboarding.mock.calls[0]?.[0]).toMatchObject({ name: "Rahul" });
    });

    it.each([
      ["markup", "<img src=x onerror=alert(1)>"],
      ["a code fragment", "Rahul`id`"],
      ["a formula", "=1+1"],
    ])("refuses %s and does not let the learner continue", async (_label, value) => {
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.type(input, value);
      await user.tab();
      expect(await screen.findByRole("alert")).toHaveTextContent(/letters, numbers, spaces/i);
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
      expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it("explains a link-like name specifically", async () => {
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.type(input, "www.evil.com");
      await user.tab();
      expect(await screen.findByRole("alert")).toHaveTextContent(/web address/i);
    });

    it("prefills a Google name that contains a dot, and lets it through", async () => {
      const { user } = setup(verified({ name: "Rahul K." }));
      expect(await screen.findByLabelText("Your name")).toHaveValue("Rahul K.");
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    });
  });

  describe("target exam", () => {
    it("shows a loading state, then the exams as a single-choice group", async () => {
      let release: (v: unknown) => void = () => undefined;
      listShowInAppExams.mockReturnValue(
        new Promise((resolve) => {
          release = resolve;
        })
      );
      setup(verified());
      expect(screen.getByRole("status", { name: "Loading exams" })).toBeInTheDocument();
      release(EXAMS);
      expect(await screen.findByRole("radiogroup", { name: "Target exam" })).toBeInTheDocument();
    });

    it("lets the learner pick one exam and switch", async () => {
      const { user } = setup(verified());
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      expect(screen.getByRole("radio", { name: "NEET" })).toHaveAttribute("aria-checked", "true");
      await user.click(screen.getByRole("radio", { name: "JEE Main" }));
      expect(screen.getByRole("radio", { name: "NEET" })).toHaveAttribute("aria-checked", "false");
      expect(screen.getByRole("radio", { name: "JEE Main" })).toHaveAttribute("aria-checked", "true");
    });

    it("offers a retry when the exam list cannot load", async () => {
      listShowInAppExams.mockResolvedValueOnce([]);
      const { user } = setup(verified());
      expect(await screen.findByRole("alert")).toHaveTextContent(/couldn’t load the exam list/i);
      await user.click(screen.getByRole("button", { name: "Try again" }));
      expect(await screen.findByRole("radio", { name: "NEET" })).toBeInTheDocument();
    });
  });

  describe("verifying the mobile number", () => {
    it("tells the parent when the number is verified", async () => {
      const updated = verified();
      verifyMyPhone.mockResolvedValue({ ok: true, data: updated });
      const { user, onProfileChange } = setup(profile());
      await user.click(await screen.findByText("simulate verified code"));
      await waitFor(() => expect(onProfileChange).toHaveBeenCalledWith(updated));
      expect(verifyMyPhone).toHaveBeenCalledWith("msg91-token");
      expect(lastOutcome).toEqual({ ok: true });
    });

    it("sends the learner back for a new number when it belongs to another account", async () => {
      verifyMyPhone.mockResolvedValue({
        ok: false,
        status: 409,
        message: "This mobile number is already linked to another account.",
      });
      const { user, onProfileChange } = setup(profile());
      await user.click(await screen.findByText("simulate verified code"));
      await waitFor(() => expect(lastOutcome).toBeDefined());
      expect(lastOutcome).toEqual({
        ok: false,
        retryable: false,
        message: "This mobile number is already linked to another account.",
      });
      expect(onProfileChange).not.toHaveBeenCalled();
    });

    it("keeps the code usable on a network or server failure", async () => {
      const { user } = setup(profile());
      verifyMyPhone.mockResolvedValueOnce({ ok: false, message: "offline" });
      await user.click(await screen.findByText("simulate verified code"));
      await waitFor(() => expect(lastOutcome).toMatchObject({ retryable: true }));

      verifyMyPhone.mockResolvedValueOnce({ ok: false, status: 503, message: "down" });
      await user.click(screen.getByText("simulate verified code"));
      await waitFor(() => expect(lastOutcome).toMatchObject({ retryable: true, message: "down" }));
    });
  });

  describe("finishing", () => {
    it("saves the tidied name and the chosen exam, then opens the app", async () => {
      const done = verified({ profileComplete: true });
      completeOnboarding.mockResolvedValue({ ok: true, data: done });
      const { user, onComplete } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      await user.type(input, "  rahul   sharma ");
      await user.click(screen.getByRole("radio", { name: "NEET" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));

      await waitFor(() => expect(onComplete).toHaveBeenCalledWith(done));
      expect(completeOnboarding).toHaveBeenCalledWith({
        name: "rahul sharma",
        targetExamId: "neet",
      });
    });

    it("explains what is still missing, one thing at a time", async () => {
      const { user } = setup(verified());
      const input = await screen.findByLabelText("Your name");
      await user.clear(input);
      expect(screen.getByText("Add your name to continue.")).toBeInTheDocument();
      await user.type(input, "Rahul");
      expect(screen.getByText("Pick your target exam to continue.")).toBeInTheDocument();
      await user.click(screen.getByRole("radio", { name: "NEET" }));
      expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
      expect(screen.queryByText(/to continue\.$/)).not.toBeInTheDocument();
    });

    it("shows the server's message and stays on the screen when saving fails", async () => {
      completeOnboarding.mockResolvedValue({ ok: false, status: 400, message: "Please choose a valid exam." });
      const { user, onComplete } = setup(verified());
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(await screen.findByText("Please choose a valid exam.")).toBeInTheDocument();
      expect(onComplete).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled();
    });

    it("cannot be submitted twice while saving", async () => {
      let finish: (v: unknown) => void = () => undefined;
      completeOnboarding.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
      const { user } = setup(verified());
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      await user.click(screen.getByRole("button", { name: "Continue" }));
      expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
      finish({ ok: true, data: verified({ profileComplete: true }) });
      await waitFor(() => expect(completeOnboarding).toHaveBeenCalledTimes(1));
    });

    it("blocks submit without a verified number even if the rest is filled in", async () => {
      const { user } = setup(profile());
      await user.click(await screen.findByRole("radio", { name: "NEET" }));
      expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
      await user.keyboard("{Enter}");
      expect(completeOnboarding).not.toHaveBeenCalled();
    });
  });

  it("always offers Log out, so nobody is trapped on this screen", async () => {
    const { user } = setup(profile());
    await user.click(await screen.findByRole("button", { name: "Log out" }));
    expect(logout).toHaveBeenCalled();
  });
});
