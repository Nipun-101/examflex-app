/** Up to two initials from a display name; falls back to "EF" for ExamFlex. */
export function profileInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "EF";
  }

  const first = parts[0]!.charAt(0);
  const last =
    parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : "";

  return `${first}${last}`.toUpperCase();
}
