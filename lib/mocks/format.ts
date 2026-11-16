/** "3h 20min", "45 min", or an em dash when unknown. */
export function formatDurationMinutes(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h ${rest}min` : `${hours}h`;
}

export function formatCount(value?: number | null): string {
  return value === undefined || value === null ? "—" : String(value);
}

export function formatMarksPerQuestion(marks: number): string {
  return `${marks} ${marks === 1 ? "mark" : "marks"}/Q`;
}

/** API amounts are integer paise; the UI shows rupees. */
export function formatPaiseAsRupees(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

const DURATION_PRESET_LABELS: Record<string, string> = {
  "1M": "1 month",
  "3M": "3 months",
  "6M": "6 months",
  "12M": "12 months",
  LIFETIME: "Lifetime",
};

export function formatDurationPreset(preset: string): string {
  return DURATION_PRESET_LABELS[preset] ?? preset;
}
