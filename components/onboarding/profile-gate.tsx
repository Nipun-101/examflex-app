"use client";

import { useEffect, useState, type ReactNode } from "react";
import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { StudyAuthFallback } from "@/components/study/study-auth-fallback";
import { StudyButton } from "@/components/study/study-button";
import { getMyProfile } from "@/lib/api/users";
import {
  clearProfileCompleteHint,
  logout,
  setProfileCompleteHint,
} from "@/lib/auth/tokens";
import type { ApiUserProfile } from "@/types/user";

type GateState =
  /** The hint says this learner finished onboarding: the app is shown while we confirm. */
  | { status: "assumed" }
  | { status: "loading" }
  | { status: "ready"; profile: ApiUserProfile }
  | { status: "error"; message: string };

type ProfileGateProps = {
  children: ReactNode;
  /**
   * The server saw the "profile complete" hint cookie, so it rendered the real
   * app. We keep showing it while the API confirms, instead of swapping in a
   * loading screen. If the API says otherwise the learner is moved to onboarding.
   */
  initiallyComplete?: boolean;
};

function rememberVerdict(profile: ApiUserProfile): void {
  if (profile.profileComplete === true) {
    setProfileCompleteHint();
  } else {
    clearProfileCompleteHint();
  }
}

/**
 * Nothing in the signed-in app opens until the learner has a verified mobile
 * number, a name and a target exam. The API enforces the same rule
 * (403 PROFILE_INCOMPLETE); this is the screen that gets them through it.
 */
export function ProfileGate({
  children,
  initiallyComplete = false,
}: ProfileGateProps) {
  const { status: authStatus } = useAuthSession();
  const [state, setState] = useState<GateState>(
    initiallyComplete ? { status: "assumed" } : { status: "loading" }
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    void (async () => {
      const result = await getMyProfile();
      if (cancelled) return;
      if (result.ok) {
        rememberVerdict(result.data);
        setState({ status: "ready", profile: result.data });
        return;
      }
      // A failed check must not take the app away from someone we already know
      // finished onboarding (the API enforces the rule on every request anyway).
      setState((previous) =>
        previous.status === "assumed"
          ? previous
          : { status: "error", message: result.message }
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [authStatus, attempt]);

  if (state.status === "assumed") {
    return <>{children}</>;
  }

  if (authStatus !== "authenticated" || state.status === "loading") {
    return <StudyAuthFallback />;
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-study-canvas px-4 text-center text-study-ink">
        <h1 className="font-display text-xl font-semibold">
          We couldn’t open your account
        </h1>
        <p role="alert" className="max-w-sm text-sm text-study-muted-soft">
          {state.message}
        </p>
        <div className="flex gap-3">
          <StudyButton
            variant="ink"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((value) => value + 1);
            }}
            className="inline-flex h-11 items-center rounded-[10px] px-5 text-sm font-medium"
          >
            Try again
          </StudyButton>
          <StudyButton
            variant="surface"
            onClick={() => void logout()}
            className="inline-flex h-11 items-center rounded-[10px] px-5 text-sm font-medium"
          >
            Log out
          </StudyButton>
        </div>
      </div>
    );
  }

  if (state.profile.profileComplete !== true) {
    return (
      <OnboardingScreen
        profile={state.profile}
        onProfileChange={(profile) => setState({ status: "ready", profile })}
        onComplete={(profile) => {
          rememberVerdict(profile);
          setState({ status: "ready", profile });
        }}
      />
    );
  }

  return <>{children}</>;
}
