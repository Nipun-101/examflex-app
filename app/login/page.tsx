import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/login-panel";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Log in · ${APP_NAME}`,
  description: `Sign in to ${APP_NAME} with Google or your mobile number.`,
};

export default function LoginPage() {
  return (
    <>
      <LandingHeader />
      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-soft via-background to-background"
        />
        <div className="relative min-h-[70vh]" />
        <LoginPanel />
      </main>
      <LandingFooter />
    </>
  );
}
