import type { Metadata } from "next";
import { Suspense } from "react";
import { MistakeBookSessionClient } from "@/components/mistake-book/mistake-book-session-client";

type MistakeBookSessionPageProps = {
  params: Promise<{ mockTestId: string }>;
};

export const metadata: Metadata = {
  title: "Mistake Book review",
  description: "Clear wrong and blank answers from this mock paper.",
};

async function MistakeBookSessionContent({
  params,
}: MistakeBookSessionPageProps) {
  const { mockTestId } = await params;
  return <MistakeBookSessionClient mockTestId={mockTestId} />;
}

export default function MistakeBookSessionPage({
  params,
}: MistakeBookSessionPageProps) {
  return (
    <Suspense fallback={null}>
      <MistakeBookSessionContent params={params} />
    </Suspense>
  );
}
