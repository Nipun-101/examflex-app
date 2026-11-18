import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileView } from "@/components/profile/profile-view";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import { profileChromeFromPageData } from "@/lib/profile/chrome";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";
import type { ApiUserProfile } from "@/types/user";

function renderProfile(ui: ReactElement) {
  return render(<StudyLoadingProvider>{ui}</StudyLoadingProvider>);
}

const getMyProfile = vi.fn();
const updateMyProfile = vi.fn();
const getBadges = vi.fn();
const useAuthSession = vi.fn();

vi.mock("@/components/providers/auth-session-provider", () => ({
  useAuthSession: () => useAuthSession(),
}));

vi.mock("@/lib/api/users", () => ({
  getMyProfile: (...args: unknown[]) => getMyProfile(...args),
  updateMyProfile: (...args: unknown[]) => updateMyProfile(...args),
}));

vi.mock("@/lib/api/analytics", () => ({
  getBadges: (...args: unknown[]) => getBadges(...args),
}));

vi.mock("@/lib/equation-book/list-show-in-app-exams", () => ({
  listShowInAppExams: vi.fn(async () => [
    { id: "e-neet", name: "NEET UG" },
    { id: "e-jee", name: "JEE MAINS" },
  ]),
}));

const chrome = profileChromeFromPageData(PROFILE_PAGE_DATA);

const apiProfile: ApiUserProfile = {
  id: "u1",
  name: "Aarav Mehta",
  email: "aarav.mehta@example.com",
  phoneNumber: "+919876543210",
  role: "user",
  isActive: true,
  membershipTier: "bronze",
  badgesEarnedCount: 1,
  createdAt: "2025-03-15T10:00:00.000Z",
  updatedAt: "2025-03-15T10:00:00.000Z",
};

const badgesSummary = {
  earnedCount: 1,
  totalCount: 1,
  badges: [
    {
      id: "first-test",
      name: "First Test",
      description: "Complete your first mock test",
      category: "Milestone",
      criteria: "Complete 1 test",
      isEarned: true,
    },
  ],
};

describe("ProfileView", () => {
  beforeEach(() => {
    getMyProfile.mockReset();
    updateMyProfile.mockReset();
    getBadges.mockReset();
    useAuthSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      token: "tok",
      refresh: vi.fn(),
    });
    getMyProfile.mockResolvedValue({ ok: true, data: apiProfile });
    updateMyProfile.mockResolvedValue({
      ok: true,
      data: { ...apiProfile, name: "Riya Sharma" },
    });
    getBadges.mockResolvedValue({ ok: true, data: badgesSummary });
  });

  it("waits while auth is still loading", () => {
    useAuthSession.mockReturnValue({
      status: "loading",
      isAuthenticated: false,
      token: null,
      refresh: vi.fn(),
    });

    renderProfile(<ProfileView chrome={chrome} />);
    expect(
      screen.getByRole("alertdialog", { name: "Loading your desk..." })
    ).toBeInTheDocument();
    expect(getMyProfile).not.toHaveBeenCalled();
  });

  it("does not fetch while signed out", () => {
    useAuthSession.mockReturnValue({
      status: "unauthenticated",
      isAuthenticated: false,
      token: null,
      refresh: vi.fn(),
    });

    renderProfile(<ProfileView chrome={chrome} />);
    // Still loading profile state until auth resolves; overlay stays up.
    expect(
      screen.getByRole("alertdialog", { name: "Loading your desk..." })
    ).toBeInTheDocument();
    expect(getMyProfile).not.toHaveBeenCalled();
  });

  it("loads profile and badges from the API", async () => {
    renderProfile(<ProfileView chrome={chrome} />);

    expect(
      screen.getByRole("alertdialog", { name: "Loading your desk..." })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Aarav Mehta" })
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Full name")).toHaveValue("Aarav Mehta");
    expect(screen.getByLabelText("Mobile")).toHaveAttribute("readonly");
    expect(screen.getByText("Prep pulse")).toBeInTheDocument();
    expect(screen.getByText("First Test")).toBeInTheDocument();
    expect(screen.getByText("Bronze")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Not set yet" })
    ).toBeInTheDocument();
  });

  it("lets the student set a target exam from profile", async () => {
    const user = userEvent.setup();
    updateMyProfile.mockResolvedValue({
      ok: true,
      data: {
        ...apiProfile,
        targetExam: { id: "e-neet", name: "NEET UG" },
      },
    });

    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Choose exam/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Choose exam/i }));
    await user.click(screen.getByRole("button", { name: "NEET UG" }));

    await waitFor(() => {
      expect(updateMyProfile).toHaveBeenCalledWith({ targetExam: "e-neet" });
      expect(
        screen.getByRole("heading", { name: "NEET UG" })
      ).toBeInTheDocument();
    });
  });

  it("shows a Google profile photo when the API returns one", async () => {
    getMyProfile.mockResolvedValue({
      ok: true,
      data: {
        ...apiProfile,
        avatarUrl: "https://lh3.googleusercontent.com/a/photo",
      },
    });

    const { container } = renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(container.querySelector("img")).toHaveAttribute(
        "src",
        "https://lh3.googleusercontent.com/a/photo"
      );
    });
  });

  it("validates, saves via PATCH, and resets contact details", async () => {
    const user = userEvent.setup();
    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toHaveValue("Aarav Mehta");
    });

    const nameInput = screen.getByLabelText("Full name");
    await user.clear(nameInput);
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Add your name.");

    await user.type(nameInput, "Riya Sharma");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => {
      expect(updateMyProfile).toHaveBeenCalledWith({ name: "Riya Sharma" });
      expect(screen.getByRole("status")).toHaveTextContent("Saved.");
    });
    expect(
      screen.getByRole("heading", { name: "Riya Sharma" })
    ).toBeInTheDocument();

    await user.clear(nameInput);
    await user.type(nameInput, "Temp Name");
    expect(screen.getByRole("button", { name: "Reset" })).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(nameInput).toHaveValue("Riya Sharma");
  });

  it("surfaces load errors with retry", async () => {
    const user = userEvent.setup();
    getMyProfile
      .mockResolvedValueOnce({
        ok: false,
        message: "Could not load your profile.",
      })
      .mockResolvedValueOnce({ ok: true, data: apiProfile });

    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not load your profile."
      );
    });

    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Aarav Mehta" })
      ).toBeInTheDocument();
    });
  });

  it("clears a field error on edit", async () => {
    const user = userEvent.setup();
    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Email")).toHaveValue(
        "aarav.mehta@example.com"
      );
    });

    await user.clear(screen.getByLabelText("Email"));
    await user.click(screen.getByRole("button", { name: "Save details" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Add an email address.");

    await user.type(screen.getByLabelText("Email"), "riya@example.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows save errors from the API", async () => {
    const user = userEvent.setup();
    updateMyProfile.mockResolvedValue({
      ok: false,
      message: "Email already in use.",
    });

    renderProfile(<ProfileView chrome={chrome} />);
    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Full name"), " X");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Email already in use."
      );
    });
  });

  it("saves locally when sanitized values match without a PATCH", async () => {
    const user = userEvent.setup();
    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toHaveValue("Aarav Mehta");
    });

    const nameInput = screen.getByLabelText("Full name");
    await user.clear(nameInput);
    await user.type(nameInput, "Aarav  Mehta");
    await user.click(screen.getByRole("button", { name: "Save details" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("Saved.");
    });
    expect(updateMyProfile).not.toHaveBeenCalled();
  });

  it("surfaces badge errors and retries badges independently", async () => {
    const user = userEvent.setup();
    getBadges
      .mockResolvedValueOnce({
        ok: false,
        message: "Could not load badges.",
      })
      .mockResolvedValueOnce({ ok: true, data: badgesSummary });

    renderProfile(<ProfileView chrome={chrome} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Could not load badges."
      );
    });

    await user.click(screen.getByRole("button", { name: "Retry badges" }));
    await waitFor(() => {
      expect(screen.getByText("First Test")).toBeInTheDocument();
    });
  });
});
