import type { Metadata } from "next";
import { AttemptPageClient } from "@/components/attempt/attempt-page-client";

export const metadata: Metadata = {
  title: "Mock test",
};

export default async function AttemptPage({
  params,
}: PageProps<"/mocks/attempt/[attemptId]">) {
  const { attemptId } = await params;
  return <AttemptPageClient attemptId={attemptId} />;
}
