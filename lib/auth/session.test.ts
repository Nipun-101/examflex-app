import { describe, expect, it } from "vitest";
import {
  DEMO_SESSION_USER,
  getSession,
  requireSession,
  resolveRequiredSession,
} from "@/lib/auth/session";

describe("auth session groundwork", () => {
  it("returns a demo signed-in session until real auth lands", async () => {
    await expect(getSession()).resolves.toEqual({ user: DEMO_SESSION_USER });
  });

  it("resolves a required session from an existing session", () => {
    expect(
      resolveRequiredSession({ user: DEMO_SESSION_USER })
    ).toEqual({ user: DEMO_SESSION_USER });
  });

  it("falls back to the demo user when no session exists yet", () => {
    expect(resolveRequiredSession(null)).toEqual({ user: DEMO_SESSION_USER });
  });

  it("requireSession returns the resolved session", async () => {
    await expect(requireSession()).resolves.toEqual({
      user: DEMO_SESSION_USER,
    });
  });
});
