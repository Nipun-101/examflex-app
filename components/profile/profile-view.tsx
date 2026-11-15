"use client";

import { useState } from "react";
import { ProfileContactForm } from "@/components/profile/profile-contact-form";
import { ProfileIdentityCard } from "@/components/profile/profile-identity-card";
import { ProfilePrepSnapshot } from "@/components/profile/profile-prep-snapshot";
import { resolveProfileAvatarUrl } from "@/lib/profile/avatar";
import {
  hasProfileFieldErrors,
  isProfileContactDirty,
  sanitizeProfileContact,
  validateProfileContact,
} from "@/lib/profile/validate";
import type {
  ProfileContact,
  ProfileFieldErrors,
  ProfileFieldKey,
  ProfilePageData,
} from "@/types/profile";

type ProfileViewProps = {
  data: ProfilePageData;
};

function toContact(user: ProfilePageData["user"]): ProfileContact {
  return {
    name: user.name,
    phone: user.phone,
    email: user.email,
  };
}

export function ProfileView({ data }: ProfileViewProps) {
  const [saved, setSaved] = useState<ProfileContact>(() => toContact(data.user));
  const [draft, setDraft] = useState<ProfileContact>(() => toContact(data.user));
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const dirty = isProfileContactDirty(draft, saved);
  const avatarUrl = resolveProfileAvatarUrl(
    data.user.signInMethod,
    data.user.avatarUrl
  );

  function handleFieldChange(field: ProfileFieldKey, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
    setStatusMessage(null);
  }

  function handleSave() {
    const nextErrors = validateProfileContact(draft);
    setErrors(nextErrors);
    if (hasProfileFieldErrors(nextErrors)) {
      setStatusMessage(null);
      return;
    }

    const sanitized = sanitizeProfileContact(draft);
    setDraft(sanitized);
    setSaved(sanitized);
    setStatusMessage("Saved on this device.");
  }

  function handleReset() {
    setDraft(saved);
    setErrors({});
    setStatusMessage(null);
  }

  return (
    <div className="flex w-full flex-col gap-5 lg:gap-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-study-ink sm:text-[2rem] lg:text-[2.5rem]">
            {data.title}
          </h1>
          <p className="mt-1 text-sm text-study-muted-soft lg:text-base">
            {data.tagline}
          </p>
        </div>
        <p className="text-[0.6875rem] whitespace-pre text-study-muted-soft">
          {data.examBadge}
        </p>
      </header>

      <ProfileIdentityCard
        name={draft.name}
        examTrack={data.user.examTrack}
        memberSinceLabel={data.user.memberSinceLabel}
        identityHint={data.identityHint}
        avatarUrl={avatarUrl}
      />

      {statusMessage ? (
        <p
          className="rounded-[12px] bg-study-lilac px-3.5 py-2.5 text-xs font-medium text-study-ink sm:text-sm"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(17rem,0.9fr)] lg:items-start lg:gap-8">
        <ProfileContactForm
          title={data.contactSectionTitle}
          subtitle={data.contactSectionSubtitle}
          values={draft}
          errors={errors}
          dirty={dirty}
          saveLabel={data.saveLabel}
          resetLabel={data.resetLabel}
          onChange={handleFieldChange}
          onSave={handleSave}
          onReset={handleReset}
        />

        <ProfilePrepSnapshot
          title={data.snapshotTitle}
          subtitle={data.snapshotSubtitle}
          stats={data.snapshot}
          privacyNote={data.privacyNote}
        />
      </div>
    </div>
  );
}
