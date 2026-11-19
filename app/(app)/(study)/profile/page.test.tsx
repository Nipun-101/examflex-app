import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "@/app/(app)/(study)/profile/page";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/profile",
  useSearchParams: () => new URLSearchParams(),
}));

const getMyProfile = vi.fn();const getBadges = vi.fn();
const useAuthSession = vi.fn();

vi.mock("@/components/providers/auth-session-provider", () => ({
  useAuthSession: () => useAuthSession(),
}));

vi.mock("@/lib/api/users", () => ({
  getMyProfile: (...args: unknown[]) => getMyProfile(...args),
  updateMyProfile: vi.fn(),
}));

vi.mock("@/lib/api/analytics", () => ({
  getBadges: (...args: unknown[]) => getBadges(...args),
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    useAuthSession.mockReturnValue({
      status: "authenticated",
      isAuthenticated: true,
      token: "tok",
      refresh: vi.fn(),
    });
    getMyProfile.mockResolvedValue({
      ok: true,
      data: {
        id: "u1",
        name: "Aarav Mehta",
        email: "aarav.mehta@example.com",
        phoneNumber: "+919876543210",
        role: "user",
        isActive: true,
        createdAt: "2025-03-15T10:00:00.000Z",
        updatedAt: "2025-03-15T10:00:00.000Z",
      },
    });
    getBadges.mockResolvedValue({
      ok: true,
      data: { badges: [], earnedCount: 0, totalCount: 0 },
    });
  });

  it("renders the profile desk", async () => {
    render(
      <StudyLoadingProvider>
        <ProfilePage />
      </StudyLoadingProvider>
    );

    expect(
      screen.getByRole("heading", { name: "Your desk" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText("Full name")).toHaveValue("Aarav Mehta");
    });
  });
});
