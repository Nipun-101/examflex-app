import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { examTestListPath } from "@/lib/mocks/exam-test-routes";

export const metadata: Metadata = {
  title: "Chapter Wise",
};

/** Redirect needs the URL id; allow a blocking segment for this leaf only. */
export const instant = false;

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Hub root redirects to Chapter Wise (default paper tab). */
export default async function ExamHubIndexPage({ params }: PageProps) {
  const { id } = await params;
  redirect(examTestListPath(id, "TOPIC_WISE"));
}
