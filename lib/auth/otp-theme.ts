/** Tailwind classes for the OTP forms, per surface. */
export type OtpTheme = {
  label: string;
  input: string;
  prefix: string;
  primary: string;
  secondary: string;
  link: string;
  muted: string;
  error: string;
  notice: string;
  slot: string;
  slotActive: string;
  spinner: string;
};

export const OTP_THEMES: Record<"landing" | "study", OtpTheme> = {
  landing: {
    label: "text-xs font-semibold tracking-wide text-muted-foreground uppercase",
    input:
      "h-11 min-w-0 flex-1 rounded-r-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    prefix:
      "inline-flex h-11 items-center rounded-l-xl border border-r-0 border-border bg-muted px-3 text-sm font-medium text-foreground",
    primary:
      "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60",
    secondary:
      "inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60",
    link: "text-sm font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60",
    muted: "text-sm text-muted-foreground",
    error: "text-sm text-destructive",
    notice: "text-sm text-primary",
    slot: "border-border bg-card text-foreground",
    slotActive: "border-primary bg-card text-foreground ring-2 ring-primary/30",
    spinner: "border-current/30 border-t-current",
  },
  study: {
    label:
      "text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase",
    input:
      "h-12 min-w-0 flex-1 rounded-r-[10px] border border-study-divider bg-study-canvas px-3 text-sm text-study-ink placeholder:text-study-muted-soft/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-study-green",
    prefix:
      "inline-flex h-12 items-center rounded-l-[10px] border border-r-0 border-study-divider bg-study-mint px-3 text-sm font-semibold text-study-ink",
    primary:
      "inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-study-ink px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
    secondary:
      "inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-study-divider bg-white px-4 text-sm font-medium text-study-green hover:bg-study-mint disabled:cursor-not-allowed disabled:opacity-40",
    link: "cursor-pointer text-sm font-medium text-study-green hover:underline disabled:cursor-not-allowed disabled:opacity-40",
    muted: "text-sm text-study-muted-soft",
    error: "text-sm text-study-peach-ink",
    notice: "text-sm text-study-green",
    slot: "border-study-divider bg-white text-study-ink",
    slotActive:
      "border-study-green bg-white text-study-ink ring-2 ring-study-green/25",
    spinner: "border-white/40 border-t-white",
  },
};
