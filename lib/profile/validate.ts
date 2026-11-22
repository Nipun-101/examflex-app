import { normalizeName, validateName } from "@/lib/onboarding/validate";
import type {
  ProfileContact,
  ProfileFieldErrors,
} from "@/types/profile";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_PATTERN = /^\d{10}$/;

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export type ValidateProfileContactOptions = {
  /** When true, phone is identity and not validated for edits. */
  phoneLocked?: boolean;
};

/**
 * Errors for the fields Save sends. The email is not one of them: it is added
 * by verifying it with a code (see `emailVerifyError`).
 */
export function validateProfileContact(
  contact: ProfileContact,
  options: ValidateProfileContactOptions = {}
): ProfileFieldErrors {
  const { phoneLocked = false } = options;
  const errors: ProfileFieldErrors = {};
  const phoneDigits = normalizePhoneDigits(contact.phone);

  // Same rules as the API: a name the browser lets through must also pass there.
  const nameError = validateName(contact.name);
  if (nameError) {
    errors.name = nameError;
  }

  if (!phoneLocked) {
    if (phoneDigits.length > 0 && !PHONE_DIGITS_PATTERN.test(phoneDigits)) {
      errors.phone = "Use a 10-digit Indian mobile number.";
    }
  }

  return errors;
}

/** Why this email cannot be sent a code yet, or null when it can. */
export function emailVerifyError(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) return "Add an email address.";
  if (!EMAIL_PATTERN.test(trimmed)) return "That email does not look right.";
  return null;
}

export function hasProfileFieldErrors(errors: ProfileFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Unsaved changes to the fields Save sends. A typed, unverified email is not
 * one of them: it is added through verification instead.
 */
export function isProfileContactDirty(
  current: ProfileContact,
  saved: ProfileContact
): boolean {
  return (
    current.name.trim() !== saved.name.trim() ||
    normalizePhoneDigits(current.phone) !== normalizePhoneDigits(saved.phone)
  );
}

export function sanitizeProfileContact(contact: ProfileContact): ProfileContact {
  return {
    name: normalizeName(contact.name),
    phone: normalizePhoneDigits(contact.phone),
    email: contact.email.trim().toLowerCase(),
  };
}
