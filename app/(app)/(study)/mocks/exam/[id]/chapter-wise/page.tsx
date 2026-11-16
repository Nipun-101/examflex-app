import type { Metadata } from "next";
import { ChapterWiseList } from "@/components/mocks/chapter-wise-list";

export const metadata: Metadata = {
  title: "Chapter Wise",
};

/** Sync server page — id comes from ExamPageProvider in the client layout. */
export default function ChapterWisePage() {
  return <ChapterWiseList />;
}
