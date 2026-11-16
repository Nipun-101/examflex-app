"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";
import { ProfileIdentityCard } from "@/components/profile/profile-identity-card";
import { ProfilePrepSnapshot } from "@/components/profile/profile-prep-snapshot";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { getBadges } from "@/lib/api/analytics";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import { resolveProfileAvatarUrl } from "@/lib/profile/avatar";
import {
  buildUpdatePayload,
  contactFromProfileUser,
  mapApiUserToProfileUser,
} from "@/lib/profile/map-user";
import {
  hasProfileFieldErrors,
  isProfileContactDirty,
  sanitizeProfileContact,
  validateProfileContact,
} from "@/lib/profile/validate";
import type { BadgesSummary } from "@/types/analytics";
import type {
  ProfileBadgesState,
  ProfileContact,
  ProfileFieldErrors,
  ProfileFieldKey,
  ProfilePageChrome,
  ProfileUser,
} from "@/types/profile";
import type { ApiUserProfile } from "@/types/user";

type ProfileViewProps = {
  chrome: ProfilePageChrome;
};

type ReadyProfile = {
  user: ProfileUser;
  saved: ProfileContact;
  draft: ProfileContact;
  phoneLocked: boolean;
};

type ProfileLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & ReadyProfile);

type DeskFetchResult = {
  profile: ApiUserProfile | null;
  profileError: string | null;
  badges: BadgesSummary | null;
  badgesError: string | null;
};

async function fetchDeskData(): Promise<DeskFetchResult> {
  const [profileResult, badgesResult] = await Promise.all([
    getMyProfile(),
    getBadges(),
  ]);

  return {
    profile: profileResult.ok ? profileResult.data : null,
    profileError: profileResult.ok ? null : profileResult.message,
    badges: badgesResult.ok ? badgesResult.data : null,
    badgesError: badgesResult.ok ? null : badgesResult.message,
  };
}

export function ProfileView({ chrome }: ProfileViewProps) {
  const { status: authStatus, isAuthenticated } = useAuthSession();
  const studyLoading = useStudyLoadingOverlay();

  const [profileState, setProfileState] = useState<ProfileLoadState>({
    status: "loading",
  });
  const [badgesState, setBadgesState] = useState<ProfileBadgesState>({
    status: "loading",
  });
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const applyUser = useCallback((user: ProfileUser) => {
    const contact = contactFromProfileUser(user);
    setProfileState({
      status: "ready",
      user,
      saved: contact,
      draft: contact,
      phoneLocked: user.phoneLocked,
    });
    setErrors({});
  }, []);

  const applyDeskResult = useCallback(
    (result: DeskFetchResult) => {
      if (result.profileError || !result.profile) {
        setProfileState({
          status: "error",
          message: result.profileError ?? "Could not load your profile.",
        });
      } else {
        applyUser(mapApiUserToProfileUser(result.profile));
      }

      if (result.badgesError || !result.badges) {
        setBadgesState({
          status: "error",
          message: result.badgesError ?? "Could not load badges.",
        });
      } else {
        setBadgesState({ status: "ready", summary: result.badges });
      }
    },
    [applyUser]
  );

  useEffect(() => {
    if (authStatus === "loading" || !isAuthenticated) return;

    let cancelled = false;

    void fetchDeskData().then((result) => {
      if (cancelled) return;
      applyDeskResult(result);
    });

    return () => {
      cancelled = true;
    };
  }, [authStatus, isAuthenticated, applyDeskResult]);

  function commitReady(ready: ReadyProfile, patch: Partial<ReadyProfile>) {
    setProfileState({ ...ready, status: "ready", ...patch });
  }

  function handleFieldChange(
    ready: ReadyProfile,
    field: ProfileFieldKey,
    value: string
  ) {
    commitReady(ready, { draft: { ...ready.draft, [field]: value } });
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatusMessage(null);
  }

  async function handleSave(ready: ReadyProfile) {
    const nextErrors = validateProfileContact(ready.draft, {
      phoneLocked: ready.phoneLocked,
    });
    setErrors(nextErrors);
    if (hasProfileFieldErrors(nextErrors)) {
      setStatusMessage(null);
      return;
    }

    const sanitized = sanitizeProfileContact(ready.draft);
    const payload = buildUpdatePayload(
      sanitized,
      ready.saved,
      ready.phoneLocked
    );
    if (Object.keys(payload).length === 0) {
      commitReady(ready, { draft: sanitized, saved: sanitized });
      setStatusMessage("Saved.");
      return;
    }

    setSaving(true);
    setStatusMessage(null);
    const result = await studyLoading.run(
      () => updateMyProfile(payload),
      { label: "Saving your details..." }
    );
    setSaving(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    applyUser(mapApiUserToProfileUser(result.data));
    setStatusMessage("Saved.");
  }

  function handleReset(ready: ReadyProfile) {
    commitReady(ready, { draft: ready.saved });
    setErrors({});
    setStatusMessage(null);
  }

  function handleRetryDesk() {
    setStatusMessage(null);
    setProfileState({ status: "loading" });
    setBadgesState({ status: "loading" });
    void fetchDeskData().then(applyDeskResult);
  }

  function handleRetryBadges() {
    setBadgesState({ status: "loading" });
    void studyLoading.run(
      async () => {
        const result = await getBadges();
        if (!result.ok) {
          setBadgesState({ status: "error", message: result.message });
          return;
        }
        setBadgesState({ status: "ready", summary: result.data });
      },
      { label: "Loading badges..." }
    );
  }

  const deskLoading =
    authStatus === "loading" || profileState.status === "loading";

  if (deskLoading) {
    return (
      <div className="flex w-full flex-col gap-5 lg:gap-8">
        <ProfileHeader chrome={chrome} />
        <StudyLoadingOverlay
          open
          scope="viewport"
          label="Loading your desk..."
        />
      </div>
    );
  }

  if (profileState.status === "error") {
    return (
      <div className="flex w-full flex-col gap-5 lg:gap-8">
        <ProfileHeader chrome={chrome} />
        <div className="flex flex-col gap-3 rounded-[18px] border border-study-divider bg-white p-4 sm:p-5">
          <p className="text-sm text-study-peach-ink" role="alert">
            {profileState.message}
          </p>
          <button
            type="button"
            onClick={handleRetryDesk}
            className="inline-flex h-11 w-fit items-center justify-center gap-1.5 rounded-[10px] border border-study-divider bg-study-canvas px-4 text-sm font-medium text-study-ink"
          >
            <RefreshCw className="size-4" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const { user, draft, saved, phoneLocked } = profileState;
  const dirty = isProfileContactDirty(draft, saved);
  const avatarUrl = resolveProfileAvatarUrl(user.signInMethod, user.avatarUrl);

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <ProfileHeader chrome={chrome} />

      <ProfileIdentityCard
        name={draft.name}
        examTrack={user.examTrack}
        memberSinceLabel={user.memberSinceLabel}
        identityHint={chrome.identityHint}
        avatarUrl={avatarUrl}
      />

      {statusMessage ? (
        <p
          className={`rounded-[12px] px-3.5 py-2.5 text-xs font-medium sm:text-sm ${
            statusMessage === "Saved."
              ? "bg-study-lilac text-study-ink"
              : "bg-study-peach/50 text-study-peach-ink"
          }`}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.9fr)] lg:items-start lg:gap-8">
        <ProfileContactForm
          title={chrome.contactSectionTitle}
          subtitle={chrome.contactSectionSubtitle}
          values={draft}
          errors={errors}
          dirty={dirty}
          phoneLocked={phoneLocked}
          saving={saving}
          saveLabel={chrome.saveLabel}
          resetLabel={chrome.resetLabel}
          onChange={(field, value) => {
            handleFieldChange(profileState, field, value);
          }}
          onSave={() => {
            void handleSave(profileState);
          }}
          onReset={() => {
            handleReset(profileState);
          }}
        />

        <ProfilePrepSnapshot
          title={chrome.snapshotTitle}
          subtitle={chrome.snapshotSubtitle}
          membershipTier={user.membershipTier}
          badges={badgesState}
          privacyNote={chrome.privacyNote}
          onRetryBadges={handleRetryBadges}
        />
      </div>
    </div>
  );
}

function ProfileHeader({ chrome }: { chrome: ProfilePageChrome }) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
          {chrome.title}
        </h1>
        <p className="mt-1 text-sm text-study-muted-soft lg:text-base">
          {chrome.tagline}
        </p>
      </div>
      <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
        {chrome.examBadge}
      </p>
    </header>
  );
}
