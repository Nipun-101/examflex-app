import type { TargetExam } from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type SessionUser = {
  id: string;
  displayName: string;
  exam: TargetExam;
};

export type Session = {
  user: SessionUser;
};

/** Subset of API `UserResponseDto` used by auth responses. */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
  isNewUser: boolean;
};
