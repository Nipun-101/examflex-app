import type { ProfileSignInMethod } from "@/types/profile";

/**
 * Google sign-in can supply a profile photo.
 * Mobile OTP sessions always fall back to the monogram placeholder.
 */
export function resolveProfileAvatarUrl(
  signInMethod: ProfileSignInMethod,
  avatarUrl: string | null
): string | null {
  if (signInMethod !== "google") {
    return null;
  }

  return avatarUrl;
}
