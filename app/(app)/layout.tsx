import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AuthenticatedAppArea } from "@/components/study/authenticated-app-area";
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
 * Signed-in app area. Session cookie read streams behind Suspense.
 * Study nav vs attempt chrome comes from nested route-group layouts.
 */
export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Suspense fallback={<StudyAuthFallback />}>
      <AuthenticatedAppArea>{children}</AuthenticatedAppArea>
    </Suspense>
  );
}
