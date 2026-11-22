import { BadgeCheck } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import type {
  ProfileContact,
  ProfileFieldErrors,
  ProfileFieldKey,
} from "@/types/profile";

type ProfileContactFormProps = {
  title: string;
  subtitle: string;
  values: ProfileContact;
  errors: ProfileFieldErrors;
  dirty: boolean;
  phoneLocked: boolean;
  emailLocked: boolean;
  /** The locked email was proven with a code (or comes from Google). */
  emailVerified?: boolean;
  saving?: boolean;
  saveLabel: string;
  resetLabel: string;
  onChange: (field: ProfileFieldKey, value: string) => void;
  onSave: () => void;
  onReset: () => void;
  /** Start proving the typed email with a code. */
  onVerifyEmail: () => void;
};

const FIELDS: readonly {
  key: ProfileFieldKey;
  label: string;
  type: "text" | "tel" | "email";
  autoComplete: string;
  inputMode?: "text" | "tel" | "email";
  placeholder: string;
}[] = [
  {
    key: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
    placeholder: "Your name",
  },
  {
    key: "phone",
    label: "Mobile",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    placeholder: "10-digit mobile",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
    placeholder: "you@example.com",
  },
];

export function ProfileContactForm({
  title,
  subtitle,
  values,
  errors,
  dirty,
  phoneLocked,
  emailLocked,
  emailVerified = false,
  saving = false,
  saveLabel,
  resetLabel,
  onChange,
  onSave,
  onReset,
  onVerifyEmail,
}: ProfileContactFormProps) {
  return (
    <section className="rounded-[18px] border border-study-divider bg-white p-4 sm:p-5 lg:p-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-study-ink lg:text-xl">
          {title}
        </h2>
        <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
          {subtitle}
        </p>
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        {FIELDS.map((field) => {
          const error = errors[field.key];
          const fieldId = `profile-${field.key}`;
          // Locked fields are truly disabled: not focusable, not clickable, and
          // they show the "not allowed" cursor on hover.
          const locked =
            (field.key === "phone" && phoneLocked) ||
            (field.key === "email" && emailLocked);
          const lockedReason =
            field.key === "phone"
              ? "Your mobile number is verified and can’t be changed here."
              : "Your email address can’t be changed here.";
          // An email is added by proving it with a code, not by Save.
          const verifiable = field.key === "email" && !locked;
          const showVerified = field.key === "email" && locked && emailVerified;
          const hintId = `${fieldId}-hint`;
          const describedBy =
            [
              error ? `${fieldId}-error` : null,
              verifiable && !error ? hintId : null,
            ]
              .filter(Boolean)
              .join(" ") || undefined;

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor={fieldId}
                  className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase"
                >
                  {field.label}
                </label>
                {showVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-study-mint px-2 py-0.5 text-[0.6875rem] font-semibold text-study-green">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                    Verified
                  </span>
                ) : null}
              </div>
              <div className="flex gap-2">
                <input
                  id={fieldId}
                  name={field.key}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  inputMode={field.inputMode}
                  placeholder={field.placeholder}
                  value={values[field.key]}
                  disabled={locked}
                  title={locked ? lockedReason : undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={
                    locked
                      ? undefined
                      : (event) => onChange(field.key, event.target.value)
                  }
                  onKeyDown={
                    verifiable
                      ? (event) => {
                          if (event.key !== "Enter") return;
                          // Enter here verifies the email; it never saves the form.
                          event.preventDefault();
                          onVerifyEmail();
                        }
                      : undefined
                  }
                  className={`h-12 min-w-0 flex-1 rounded-[10px] border border-study-divider px-3 text-sm text-study-ink placeholder:text-study-muted-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green ${
                    locked
                      ? "cursor-not-allowed bg-study-canvas/70 text-study-muted-soft"
                      : "bg-study-canvas"
                  }`}
                />
                {verifiable ? (
                  <StudyButton
                    type="button"
                    variant="outline"
                    className="inline-flex h-12 shrink-0 items-center justify-center rounded-[10px] px-4 text-sm font-medium"
                    disabled={saving || values.email.trim().length === 0}
                    onClick={onVerifyEmail}
                  >
                    Verify
                  </StudyButton>
                ) : null}
              </div>
              {error ? (
                <p
                  id={`${fieldId}-error`}
                  className="text-xs text-study-peach-ink"
                  role="alert"
                >
                  {error}
                </p>
              ) : verifiable ? (
                <p id={hintId} className="text-xs text-study-muted-soft">
                  We’ll email you a code to confirm it’s yours.
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="mt-2 flex flex-wrap gap-2">
          <StudyButton
            type="submit"
            variant="ink"
            className="inline-flex h-11 min-w-[9.5rem] items-center justify-center rounded-[10px] px-5 text-sm font-medium"
            disabled={!dirty || saving}
          >
            {saving ? "Saving…" : saveLabel}
          </StudyButton>
          <StudyButton
            type="button"
            variant="outline"
            className="inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-sm font-medium"
            disabled={!dirty || saving}
            onClick={onReset}
          >
            {resetLabel}
          </StudyButton>
        </div>
      </form>
    </section>
  );
}
