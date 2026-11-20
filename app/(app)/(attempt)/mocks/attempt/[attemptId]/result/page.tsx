import type { Metadata } from "next";
import { AttemptResultClient } from "@/components/attempt/attempt-result-client";

export const metadata: Metadata = {
  title: "Mock test results",
};

/** Results need the attempt id up front; allow a blocking segment for this leaf. */
export const instant = false;

export default async function AttemptResultPage({
  params,
}: PageProps<"/mocks/attempt/[attemptId]/result">) {
  const { attemptId } = await params;
  return <AttemptResultClient attemptId={attemptId} />;
}
