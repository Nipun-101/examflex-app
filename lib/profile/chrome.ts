import type { ProfilePageChrome, ProfilePageData } from "@/types/profile";

export function profileChromeFromPageData(
  data: ProfilePageData
): ProfilePageChrome {
  return {
    title: data.title,
    tagline: data.tagline,
    examBadge: data.examBadge,
    contactSectionTitle: data.contactSectionTitle,
    contactSectionSubtitle: data.contactSectionSubtitle,
    snapshotTitle: data.snapshotTitle,
    snapshotSubtitle: data.snapshotSubtitle,
    privacyNote: data.privacyNote,
    saveLabel: data.saveLabel,
    resetLabel: data.resetLabel,
  };
}
