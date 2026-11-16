export type Msg91OtpSuccess = {
  message?: string;
};

export type Msg91OtpFailure = {
  closeByUser?: boolean;
  message?: unknown;
  type?: unknown;
};

export type Msg91WidgetConfig = {
  widgetId: string | undefined;
  tokenAuth: string | undefined;
  identifier: string;
  exposeMethods: boolean;
  success: (data: unknown) => void;
  failure: (error: unknown) => void;
};

declare global {
  interface Window {
    initSendOTP?: (config: Msg91WidgetConfig) => void;
  }
}

export function isOtpCancelled(error: unknown): boolean {
  const e =
    error && typeof error === "object" ? (error as Msg91OtpFailure) : null;
  if (e?.closeByUser === true) return true;
  const rawMsg = typeof e?.message === "string" ? e.message.toLowerCase() : "";
  const typeStr = typeof e?.type === "string" ? e.type.toLowerCase() : "";
  return rawMsg.includes("cancel") || typeStr.includes("cancel");
}

export function otpErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "That code didn’t match or something went wrong. Please try again.";
  }
  const e = error as Msg91OtpFailure;
  const rawMsg = typeof e.message === "string" ? e.message.trim() : "";
  return (
    rawMsg ||
    "That code didn’t match or something went wrong. Please try again."
  );
}

export function extractMsg91AccessToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const message = (data as Msg91OtpSuccess).message;
  if (typeof message !== "string" || !message.trim()) return null;
  return message.trim();
}
