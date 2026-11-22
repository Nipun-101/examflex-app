"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ExamChoiceModal } from "@/components/equation-book/exam-choice-modal";
import { EmailVerifyDialog } from "@/components/profile/email-verify-dialog";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";
import { ProfileIdentityCard } from "@/components/profile/profile-identity-card";
import { ProfilePrepSnapshot } from "@/components/profile/profile-prep-snapshot";
import { ProfileTargetExamCard } from "@/components/profile/profile-target-exam-card";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { StudyRouteLoading } from "@/components/study/study-route-loading";
import { useStudyLoadingOverlay } from "@/components/study/study-loading-provider";
import { getBadges } from "@/lib/api/analytics";
import { getMyProfile, updateMyProfile } from "@/lib/api/users";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { resolveProfileAvatarUrl } from "@/lib/profile/avatar";
import {
  buildUpdatePayload,
  contactFromProfileUser,
  mapApiUserToProfileUser,
} from "@/lib/profile/map-user";
import { persistTargetExam } from "@/lib/profile/persist-target-exam";
import type { EquationExamOption } from "@/types/equation-book";
import {
  emailVerifyError,
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
  emailLocked: boolean;
  emailVerified: boolean;
};

const SUCCESS_MESSAGES = new Set(["Saved.", "Email verified."]);

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
  const [examOptions, setExamOptions] = useState<EquationExamOption[]>([]);
  const [examPickerOpen, setExamPickerOpen] = useState(false);
  const [examSaving, setExamSaving] = useState(false);
  /** The email being verified while the dialog is open. */
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null);

  /**
   * Show the server's copy of the user. `keep` carries over draft edits the
   * server does not know about yet (an email still to verify, a name not yet
   * saved), so finishing one action never wipes the other.
   */
  const applyUser = useCallback(
    (user: ProfileUser, keep: Partial<ProfileContact> = {}) => {
      const contact = contactFromProfileUser(user);
      setProfileState({
        status: "ready",
        user,
        saved: contact,
        draft: {
          ...contact,
          ...keep,
          // A locked email always shows what the server has.
          ...(user.emailLocked ? { email: contact.email } : {}),
        },
        phoneLocked: user.phoneLocked,
        emailLocked: user.emailLocked,
        emailVerified: user.emailVerified,
      });
      setErrors({});
    },
    []
  );

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

    void listShowInAppExams().then((exams) => {
      if (!cancelled) setExamOptions(exams);
    });

    return () => {
      cancelled = true;
    };
  }, [authStatus, isAuthenticated, applyDeskResult]);

  async function handleTargetExamSelect(exam: EquationExamOption) {
    setExamSaving(true);
    setStatusMessage(null);
    const result = await studyLoading.run(() => persistTargetExam(exam.id), {
      label: "Saving your exam...",
    });
    setExamSaving(false);
    setExamPickerOpen(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    applyUser(mapApiUserToProfileUser(result.data));
    setStatusMessage("Saved.");
  }

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
    const payload = buildUpdatePayload(sanitized, ready.saved);
    if (Object.keys(payload).length === 0) {
      // The email is never saved here, so it stays as the server has it.
      commitReady(ready, {
        draft: sanitized,
        saved: { ...sanitized, email: ready.saved.email },
      });
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

    applyUser(mapApiUserToProfileUser(result.data), {
      email: ready.draft.email,
    });
    setStatusMessage("Saved.");
  }

  /** Only reachable while the email is editable (no real email yet). */
  function handleVerifyEmail(ready: ReadyProfile) {
    const problem = emailVerifyError(ready.draft.email);
    if (problem) {
      setErrors((current) => ({ ...current, email: problem }));
      return;
    }
    setStatusMessage(null);
    setVerifyingEmail(ready.draft.email.trim().toLowerCase());
  }

  function handleEmailVerified(ready: ReadyProfile, profile: ApiUserProfile) {
    setVerifyingEmail(null);
    applyUser(mapApiUserToProfileUser(profile), { name: ready.draft.name });
    setStatusMessage("Email verified.");
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
        <StudyRouteLoading busy />
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

  const { user, draft, saved, phoneLocked, emailLocked, emailVerified } =
    profileState;
  const dirty = isProfileContactDirty(draft, saved);
  const avatarUrl = resolveProfileAvatarUrl(user.signInMethod, user.avatarUrl);

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <ProfileHeader chrome={chrome} />

      <ProfileIdentityCard
        name={draft.name}
        examTrack={user.examTrack}
        memberSinceLabel={user.memberSinceLabel}
        avatarUrl={avatarUrl}
      />

      <ProfileTargetExamCard
        examName={user.examTrack}
        hasExam={Boolean(user.targetExamId)}
        saving={examSaving}
        onEdit={() => {
          if (examOptions.length === 0) {
            setStatusMessage(
              "No exams are available to choose yet. Try again shortly."
            );
            return;
          }
          setExamPickerOpen(true);
        }}
      />

      {statusMessage ? (
        <p
          className={`rounded-[12px] px-3.5 py-2.5 text-xs font-medium sm:text-sm ${
            SUCCESS_MESSAGES.has(statusMessage)
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
          emailLocked={emailLocked}
          emailVerified={emailVerified}
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
          onVerifyEmail={() => {
            handleVerifyEmail(profileState);
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

      {verifyingEmail ? (
        <EmailVerifyDialog
          email={verifyingEmail}
          onVerified={(profile) => {
            handleEmailVerified(profileState, profile);
          }}
          onClose={() => setVerifyingEmail(null)}
        />
      ) : null}

      <ExamChoiceModal
        open={examPickerOpen}
        exams={examOptions}
        title="Which exam are you preparing for?"
        body="This becomes your target exam across Equation Book and mocks."
        onSelect={(exam) => {
          void handleTargetExamSelect(exam);
        }}
        onDismiss={() => setExamPickerOpen(false)}
      />
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
