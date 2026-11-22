import { describe, expect, it } from "vitest";
import {
  AUTH_SESSION_COOKIE,
  LOGOUT_RESUME_PATH_COOKIE,
} from "@/lib/auth/cookie-names";

describe("cookie-names", () => {
  it("exports stable auth cookie names", () => {
    expect(AUTH_SESSION_COOKIE).toBe("authSession");
    expect(LOGOUT_RESUME_PATH_COOKIE).toBe("logoutResumePath");
  });
});
