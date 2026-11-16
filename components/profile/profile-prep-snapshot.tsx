"use client";

import { Lock, RefreshCw } from "lucide-react";
import {
  badgeVisualFor,
  formatMembershipTier,
} from "@/lib/profile/badge-visuals";
import type { ProfileBadgesState, ProfilePrivacyNote } from "@/types/profile";
import type { MembershipTier } from "@/types/user";

type ProfilePrepSnapshotProps = {
  title: string;
  subtitle: string;
  membershipTier: MembershipTier;
  badges: ProfileBadgesState;
  privacyNote: ProfilePrivacyNote;
  onRetryBadges?: () => void;
};

export function ProfilePrepSnapshot({
  title,
  subtitle,
  membershipTier,
  badges,
  privacyNote,
  onRetryBadges,
}: ProfilePrepSnapshotProps) {
  return (
    <aside className="flex flex-col gap-4 lg:gap-5">
      <section className="rounded-[18px] border border-study-divider bg-white p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold text-study-ink">
          {title}
        </h2>
        <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
          {subtitle}
        </p>

        <ul className="mt-4 grid grid-cols-2 gap-3">
          <li className="rounded-[12px] bg-study-canvas px-3.5 py-3">
            <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
              Tier
            </p>
            <p className="mt-1.5 font-display text-xl font-semibold text-study-ink">
              {formatMembershipTier(membershipTier)}
            </p>
          </li>
          <li className="rounded-[12px] bg-study-canvas px-3.5 py-3">
            <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
              Badges
            </p>
            <p className="mt-1.5 font-display text-xl font-semibold text-study-ink">
              {badges.status === "ready"
                ? `${badges.summary.earnedCount} / ${badges.summary.totalCount}`
                : "—"}
            </p>
          </li>
        </ul>

        {badges.status === "error" ? (
          <div className="mt-4 flex flex-col gap-2 rounded-[12px] bg-study-peach/40 px-3.5 py-3">
            <p className="text-xs text-study-peach-ink" role="alert">
              {badges.message}
            </p>
            {onRetryBadges ? (
              <button
                type="button"
                onClick={onRetryBadges}
                className="inline-flex h-10 w-fit items-center gap-1.5 rounded-[10px] border border-study-divider bg-white px-3 text-xs font-medium text-study-ink"
              >
                <RefreshCw className="size-3.5" aria-hidden />
                Retry badges
              </button>
            ) : null}
          </div>
        ) : null}

        {badges.status === "ready" ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {badges.summary.badges.map((badge) => {
              const { Icon } = badgeVisualFor(badge.id, badge.category);
              return (
                <li
                  key={badge.id}
                  className={`flex items-start gap-3 rounded-[12px] border border-study-divider/80 px-3 py-2.5 ${
                    badge.isEarned
                      ? "bg-study-mint/40"
                      : "bg-study-canvas/80 opacity-70"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                      badge.isEarned
                        ? "bg-study-green text-white"
                        : "bg-study-divider text-study-muted-soft"
                    }`}
                    aria-hidden
                  >
                    {badge.isEarned ? (
                      <Icon className="size-4" />
                    ) : (
                      <Lock className="size-3.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-study-ink">
                      {badge.name}
                    </p>
                    <p className="mt-0.5 text-[0.6875rem] leading-snug text-study-muted-soft">
                      {badge.isEarned ? badge.description : badge.criteria}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="rounded-[12px] bg-study-mint px-3.5 py-3.5 sm:px-4 sm:py-4">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
          {privacyNote.title}
        </p>
        <p className="mt-2 text-xs leading-[1.4] text-study-ink sm:text-[0.8125rem]">
          {privacyNote.body}
        </p>
      </section>
    </aside>
  );
}
