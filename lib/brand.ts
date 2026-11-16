function publicValue(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim() ?? "";
  return trimmed || fallback;
}

/** Public per-deployment legal/support copy. Phone and grievance officer stay blank until go-live. */
export const brand = {
  name: publicValue(process.env.NEXT_PUBLIC_BRAND_NAME, "ExamFlex"),
  legalName: publicValue(
    process.env.NEXT_PUBLIC_LEGAL_NAME,
    "ExamFlex"
  ),
  legalAddress: publicValue(
    process.env.NEXT_PUBLIC_LEGAL_ADDRESS,
    "Kerala, India"
  ),
  supportEmail: publicValue(
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    "support@examflex.in"
  ),
  supportPhone: publicValue(process.env.NEXT_PUBLIC_SUPPORT_PHONE, ""),
  grievanceOfficerName: publicValue(
    process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME,
    ""
  ),
  legalJurisdiction: publicValue(
    process.env.NEXT_PUBLIC_LEGAL_JURISDICTION,
    "Kochi, Kerala"
  ),
};
