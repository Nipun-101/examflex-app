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

export function validateProfileContact(
  contact: ProfileContact,
  options: ValidateProfileContactOptions = {}
): ProfileFieldErrors {
  const { phoneLocked = false } = options;
  const errors: ProfileFieldErrors = {};
  const name = contact.name.trim();
  const email = contact.email.trim();
  const phoneDigits = normalizePhoneDigits(contact.phone);

  if (name.length === 0) {
    errors.name = "Add your name.";
  } else if (name.length < 2) {
    errors.name = "Name needs at least 2 characters.";
  }

  if (!phoneLocked) {
    if (phoneDigits.length > 0 && !PHONE_DIGITS_PATTERN.test(phoneDigits)) {
      errors.phone = "Use a 10-digit Indian mobile number.";
    }
  }

  if (email.length === 0) {
    errors.email = "Add an email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "That email does not look right.";
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
    name: contact.name.trim().replace(/\s+/g, " "),
    phone: normalizePhoneDigits(contact.phone),
    email: contact.email.trim().toLowerCase(),
  };
}
