import type { Metadata } from "next";
import { ProfileView } from "@/components/profile/profile-view";
import { PROFILE_PAGE_DATA } from "@/lib/profile/static-data";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "Your ExamFlex desk — name, phone, email, and prep pulse placeholders until the profile API is connected.",
};

export default function ProfilePage() {
  return <ProfileView data={PROFILE_PAGE_DATA} />;
}
