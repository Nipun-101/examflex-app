import type { Metadata } from "next";
import { TodayPageView } from "@/components/study/today-page";
import { TODAY_PAGE_DATA } from "@/lib/today/static-data";

export const metadata: Metadata = {
  title: "Today",
  description:
    "Your ExamFlex study space — next step, mock insights, and a light session plan.",
};

export default function TodayPage() {
  return <TodayPageView data={TODAY_PAGE_DATA} />;
}
