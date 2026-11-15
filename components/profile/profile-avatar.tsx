import { profileInitials } from "@/lib/profile/initials";

type ProfileAvatarProps = {
  name: string;
  avatarUrl: string | null;
  size?: "md" | "lg";
};

const SIZE_CLASS = {
  md: "h-16 w-16 text-lg sm:h-20 sm:w-20 sm:text-xl lg:h-24 lg:w-24 lg:text-2xl",
  lg: "h-20 w-20 text-xl sm:h-24 sm:w-24 sm:text-2xl lg:h-28 lg:w-28 lg:text-3xl",
} as const;

export function ProfileAvatar({
  name,
  avatarUrl,
  size = "md",
}: ProfileAvatarProps) {
  const initials = profileInitials(name);

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Google profile URLs until next/image remotePatterns are wired
      <img
        src={avatarUrl}
        alt=""
        className={`${SIZE_CLASS[size]} rounded-full object-cover ring-2 ring-study-lime/80 ring-offset-2 ring-offset-study-ink`}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={`grid ${SIZE_CLASS[size]} place-items-center rounded-full bg-study-mint font-display font-semibold text-study-ink ring-2 ring-study-lime/80 ring-offset-2 ring-offset-study-ink`}
    >
      <span>{initials}</span>
    </div>
  );
}
