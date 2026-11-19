import type { Metadata } from "next";
import { Suspense } from "react";
import { MocksHome } from "@/components/mocks/mocks-home";
import { StudyRouteLoadingFallback } from "@/components/study/study-route-loading";

export const metadata: Metadata = {
  title: "Mocks",
};

export default function MocksPage() {
  return (
    <Suspense fallback={<StudyRouteLoadingFallback />}>
      <MocksHome />
    </Suspense>
  );
}
