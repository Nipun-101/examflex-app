import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProfilePrepSnapshot } from "@/components/profile/profile-prep-snapshot";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

describe("ProfilePrepSnapshot", () => {
  it("renders prep pulse stats and privacy note", () => {
    render(
      <ProfilePrepSnapshot
        title={PROFILE_PAGE_DATA.snapshotTitle}
        subtitle={PROFILE_PAGE_DATA.snapshotSubtitle}
        stats={PROFILE_PAGE_DATA.snapshot}
        privacyNote={PROFILE_PAGE_DATA.privacyNote}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Prep pulse" })
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("KEPT LIGHT ON PURPOSE")).toBeInTheDocument();
  });
});
