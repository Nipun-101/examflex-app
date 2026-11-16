import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProfilePrepSnapshot } from "@/components/profile/profile-prep-snapshot";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

const badgesSummary = {
  earnedCount: 1,
  totalCount: 2,
  badges: [
    {
      id: "first-test",
      name: "First Test",
      description: "Complete your first mock test",
      category: "Milestone",
      criteria: "Complete 1 test",
      isEarned: true,
    },
    {
      id: "streak-7",
      name: "7-Day Streak",
      description: "Maintain a 7-day streak",
      category: "Consistency",
      criteria: "7-day streak",
      isEarned: false,
    },
  ],
};

describe("ProfilePrepSnapshot", () => {
  it("renders tier, badge counts, and earned/locked rows", () => {
    render(
      <ProfilePrepSnapshot
        title={PROFILE_PAGE_DATA.snapshotTitle}
        subtitle={PROFILE_PAGE_DATA.snapshotSubtitle}
        membershipTier="bronze"
        badges={{ status: "ready", summary: badgesSummary }}
        privacyNote={PROFILE_PAGE_DATA.privacyNote}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Prep pulse" })
    ).toBeInTheDocument();
    expect(screen.getByText("Bronze")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("First Test")).toBeInTheDocument();
    expect(screen.getByText("7-Day Streak")).toBeInTheDocument();
    expect(screen.getByText("KEPT LIGHT ON PURPOSE")).toBeInTheDocument();
  });

  it("shows error retry for badges and keeps loading quiet for the overlay", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    const { rerender } = render(
      <ProfilePrepSnapshot
        title="Prep pulse"
        subtitle="Badges"
        membershipTier="none"
        badges={{ status: "loading" }}
        privacyNote={PROFILE_PAGE_DATA.privacyNote}
      />
    );
    expect(screen.queryByLabelText(/loading badges/i)).not.toBeInTheDocument();
    expect(screen.getByText("—")).toBeInTheDocument();

    rerender(
      <ProfilePrepSnapshot
        title="Prep pulse"
        subtitle="Badges"
        membershipTier="none"
        badges={{ status: "error", message: "Could not load badges." }}
        privacyNote={PROFILE_PAGE_DATA.privacyNote}
        onRetryBadges={onRetry}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not load badges."
    );
    await user.click(screen.getByRole("button", { name: "Retry badges" }));
    expect(onRetry).toHaveBeenCalledTimes(1);

    rerender(
      <ProfilePrepSnapshot
        title="Prep pulse"
        subtitle="Badges"
        membershipTier="none"
        badges={{ status: "error", message: "Could not load badges." }}
        privacyNote={PROFILE_PAGE_DATA.privacyNote}
      />
    );
    expect(
      screen.queryByRole("button", { name: "Retry badges" })
    ).not.toBeInTheDocument();
  });
});
