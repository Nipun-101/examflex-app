import type { Metadata } from "next";
import { TodayPageClient } from "@/components/study/today-page-client";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Your ExamFlex study space — next step, mock insights, and a light session plan.",
};

export default function TodayPage() {
  return <TodayPageClient />;
}
