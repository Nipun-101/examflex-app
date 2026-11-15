import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/study/placeholder-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Account settings and exam preferences will live here. Static placeholder until auth and profile APIs are connected."
    />
  );
}
