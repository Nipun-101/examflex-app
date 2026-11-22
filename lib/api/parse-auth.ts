import type { AuthResponse, AuthUser } from "@/types/auth";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseAuthUser(value: unknown): AuthUser | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || typeof value.name !== "string") {
    return null;
  }
  if (typeof value.email !== "string" || typeof value.role !== "string") {
    return null;
  }

  const user: AuthUser = {
    id: value.id,
    name: value.name,
    email: value.email,
    role: value.role,
  };

  if (typeof value.phoneNumber === "string") {
    user.phoneNumber = value.phoneNumber;
  }

  return user;
}

/**
 * Parse API auth envelope. Returns null when accessToken is missing/invalid.
 */
export function parseAuthResponse(body: unknown): AuthResponse | null {
  if (!isRecord(body)) return null;
  const data = body.data;
  if (!isRecord(data)) return null;
  if (typeof data.accessToken !== "string" || !data.accessToken) return null;

  const user = parseAuthUser(data.user);
  if (!user) return null;

  const result: AuthResponse = {
    accessToken: data.accessToken,
    user,
    isNewUser: data.isNewUser === true,
  };

  return result;
}

export function parseApiMessage(body: unknown): string | null {
  if (!isRecord(body)) return null;
  if (typeof body.message !== "string") return null;
  const trimmed = body.message.trim();
  return trimmed || null;
}
