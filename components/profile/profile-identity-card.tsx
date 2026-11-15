import { ProfileAvatar } from "@/components/profile/profile-avatar";

type ProfileIdentityCardProps = {
  name: string;
  examTrack: string;
  memberSinceLabel: string;
  identityHint: string;
  avatarUrl: string | null;
};

export function ProfileIdentityCard({
  name,
  examTrack,
  memberSinceLabel,
  identityHint,
  avatarUrl,
}: ProfileIdentityCardProps) {
  return (
    <section className="rounded-[18px] bg-study-ink px-4 py-4 text-white sm:px-5 sm:py-5 lg:px-6 lg:py-6">
      <div className="flex items-center gap-3.5 sm:gap-5 lg:gap-6">
        <div className="shrink-0">
          <ProfileAvatar name={name} avatarUrl={avatarUrl} size="md" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.625rem] font-semibold tracking-wide text-study-lime uppercase">
            {examTrack}
          </p>
          <h2 className="mt-1 font-display text-[1.375rem] font-semibold leading-tight tracking-tight text-white sm:mt-1.5 sm:text-[1.75rem] lg:text-[2rem]">
            {name.trim() || "Your name"}
          </h2>
          <p className="mt-1 text-xs text-study-on-dark sm:mt-1.5 sm:text-sm">
            {memberSinceLabel}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[0.6875rem] leading-relaxed text-study-on-dark/90">
        {identityHint}
      </p>
    </section>
  );
}
