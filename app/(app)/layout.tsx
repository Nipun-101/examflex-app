import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudyShell } from "@/components/study/study-shell";
import { requireSession } from "@/lib/auth/session";
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
 * Signed-in study area. `requireSession` is the auth gate —
 * later swap its null path for `redirect("/login")`.
 */
export default async function AppLayout({ children }: AppLayoutProps) {
  await requireSession();

  return <StudyShell>{children}</StudyShell>;
}
