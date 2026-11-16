/** FREE papers need no entitlement; ENTITLED papers need a covering entitlement. */
export type AccessMode = "FREE" | "ENTITLED";

/** What the primary action on a paper card should do for this user. */
export type UserAttemptAction = "START" | "RETAKE" | "RESUME";

/**
 * Backend-computed access for the current user.
 * A missing value means the client does not lock the paper.
 */
export interface PaperAccess {
  allowed: boolean;
  reason: string;
}

/** Access-related fields shared by every paper list item. */
export interface PaperAccessFields {
  accessMode?: AccessMode;
  access?: PaperAccess;
  userAttemptAction?: UserAttemptAction;
  resumeAttemptId?: string;
}
