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
  /** When true, the account already has an email and it cannot be edited. */
  emailLocked?: boolean;
};

export function validateProfileContact(
  contact: ProfileContact,
  options: ValidateProfileContactOptions = {}
): ProfileFieldErrors {
  const { phoneLocked = false, emailLocked = false } = options;
  const errors: ProfileFieldErrors = {};
  const email = contact.email.trim();
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

  // A locked email is the account's existing one and is never edited here.
  if (!emailLocked) {
    if (email.length === 0) {
      errors.email = "Add an email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "That email does not look right.";
    }
  }

  return errors;
}

export function hasProfileFieldErrors(errors: ProfileFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function isProfileContactDirty(
  current: ProfileContact,
  saved: ProfileContact
): boolean {
  return (
    current.name.trim() !== saved.name.trim() ||
    normalizePhoneDigits(current.phone) !== normalizePhoneDigits(saved.phone) ||
    current.email.trim().toLowerCase() !== saved.email.trim().toLowerCase()
  );
}

export function sanitizeProfileContact(contact: ProfileContact): ProfileContact {
  return {
    name: normalizeName(contact.name),
    phone: normalizePhoneDigits(contact.phone),
    email: contact.email.trim().toLowerCase(),
  };
}
