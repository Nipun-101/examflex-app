import type { Metadata } from "next";
import { MistakeBookSessionClient } from "@/components/mistake-book/mistake-book-session-client";

type MistakeBookSessionPageProps = {
  params: Promise<{ mockTestId: string }>;
};

export const metadata: Metadata = {
  title: "Mistake Book review",
  description: "Clear wrong and blank answers from this mock paper.",
};

export default async function MistakeBookSessionPage({
  params,
}: MistakeBookSessionPageProps) {
  const { mockTestId } = await params;
  return <MistakeBookSessionClient mockTestId={mockTestId} />;
}
