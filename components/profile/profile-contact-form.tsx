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
  saveLabel: string;
  resetLabel: string;
  onChange: (field: ProfileFieldKey, value: string) => void;
  onSave: () => void;
  onReset: () => void;
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
  saveLabel,
  resetLabel,
  onChange,
  onSave,
  onReset,
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

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <label
                htmlFor={fieldId}
                className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase"
              >
                {field.label}
              </label>
              <input
                id={fieldId}
                name={field.key}
                type={field.type}
                autoComplete={field.autoComplete}
                inputMode={field.inputMode}
                placeholder={field.placeholder}
                value={values[field.key]}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                onChange={(event) => onChange(field.key, event.target.value)}
                className="h-12 rounded-[10px] border border-study-divider bg-study-canvas px-3 text-sm text-study-ink placeholder:text-study-muted-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green"
              />
              {error ? (
                <p
                  id={`${fieldId}-error`}
                  className="text-xs text-study-peach-ink"
                  role="alert"
                >
                  {error}
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
            disabled={!dirty}
          >
            {saveLabel}
          </StudyButton>
          <StudyButton
            type="button"
            variant="outline"
            className="inline-flex h-11 items-center justify-center rounded-[10px] px-5 text-sm font-medium"
            disabled={!dirty}
            onClick={onReset}
          >
            {resetLabel}
          </StudyButton>
        </div>
      </form>
    </section>
  );
}
