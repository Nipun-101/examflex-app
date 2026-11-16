import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AuthenticatedStudyArea } from "@/components/study/authenticated-study-area";
import { StudyAuthFallback } from "@/components/study/study-auth-fallback";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `Today · ${APP_NAME}`,
    template: `%s · ${APP_NAME}`,
  },
};

type AppLayoutProps = {
  children: ReactNode;
};

/**
 * Signed-in study area. Session cookie read streams behind Suspense so the
 * route can still ship an instant shell under Cache Components.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<StudyAuthFallback />}>
      <AuthenticatedStudyArea>{children}</AuthenticatedStudyArea>
    </Suspense>
  );
}
