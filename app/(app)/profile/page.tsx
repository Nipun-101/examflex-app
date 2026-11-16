import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";
import { profileChromeFromPageData } from "@/lib/profile/chrome";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your ExamFlex desk — name, phone, email, and prep pulse badges from your account.",
};

export default function ProfilePage() {
  return <ProfileView chrome={profileChromeFromPageData(PROFILE_PAGE_DATA)} />;
}
