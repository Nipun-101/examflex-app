"use client";

import type { ReactNode } from "react";
import { AuthSessionProvider } from "@/components/providers/auth-session-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>;
}
