import { normalizePhoneDigits } from "@/lib/profile/validate";
import type {
  CounselingBookingFieldErrors,
  CounselingBookingForm,
  CreateCounselingRequestPayload,
} from "@/types/counseling";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_PATTERN = /^\d{10}$/;

export function validateCounselingBooking(
  form: CounselingBookingForm
): CounselingBookingFieldErrors {
  const errors: CounselingBookingFieldErrors = {};
  const { contact } = form;

  const emailEnabled = contact.emailEnabled;
  const phoneEnabled = contact.phoneEnabled;

  if (!emailEnabled && !phoneEnabled) {
    errors.contact = "Pick email and/or phone so we can reach you.";
    return errors;
  }

  if (emailEnabled) {
    const email = contact.email.trim();
    if (email.length === 0) {
      errors.email = "Add an email address.";
    } else if (!EMAIL_PATTERN.test(email)) {
      errors.email = "That email does not look right.";
    }
  }

  if (phoneEnabled) {
    const digits = normalizePhoneDigits(contact.phone);
    if (digits.length === 0) {
      errors.phone = "Add a phone number.";
    } else if (!PHONE_DIGITS_PATTERN.test(digits)) {
      errors.phone = "Use a 10-digit Indian mobile number.";
    }
  }

  return errors;
}

export function hasCounselingBookingErrors(
  errors: CounselingBookingFieldErrors
): boolean {
  return Object.keys(errors).length > 0;
}

function optionalTrimmed(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function toCreateCounselingPayload(
  form: CounselingBookingForm
): CreateCounselingRequestPayload {
  const email = form.contact.email.trim().toLowerCase();
  const phoneDigits = normalizePhoneDigits(form.contact.phone);

  return {
    ...(optionalTrimmed(form.studentName)
      ? { studentName: form.studentName.trim() }
      : {}),
    whoWillJoin: form.whoWillJoin,
    ...(optionalTrimmed(form.courseInterestedIn)
      ? { courseInterestedIn: form.courseInterestedIn.trim() }
      : {}),
    ...(optionalTrimmed(form.expectedMark)
      ? { expectedMark: form.expectedMark.trim() }
      : {}),
    ...(optionalTrimmed(form.twelfthMarks)
      ? { twelfthMarks: form.twelfthMarks.trim() }
      : {}),
    ...(optionalTrimmed(form.state) ? { state: form.state.trim() } : {}),
    ...(optionalTrimmed(form.category)
      ? { category: form.category.trim() }
      : {}),
    ...(optionalTrimmed(form.preferredDayTime)
      ? { preferredDayTime: form.preferredDayTime.trim() }
      : {}),
    ...(optionalTrimmed(form.talkAbout)
      ? { talkAbout: form.talkAbout.trim() }
      : {}),
    contact: {
      emailEnabled: form.contact.emailEnabled,
      phoneEnabled: form.contact.phoneEnabled,
      ...(form.contact.emailEnabled && email.length > 0 ? { email } : {}),
      ...(form.contact.phoneEnabled && phoneDigits.length > 0
        ? { phone: `+91${phoneDigits}` }
        : {}),
    },
  };
}
