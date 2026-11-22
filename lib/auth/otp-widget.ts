/**
 * Thin, promise-based wrapper around the MSG91 OTP widget in custom-UI mode
 * (`exposeMethods: true`). The widget sends and checks the code; every pixel the
 * learner sees is ours. The same widget id serves login and onboarding.
 */

export const MSG91_SCRIPT_SRC = "https://verify.msg91.com/otp-provider.js";

type Callback = (value: unknown) => void;

export type Msg91WidgetConfig = {
  widgetId: string | undefined;
  tokenAuth: string | undefined;
  identifier: string;
  exposeMethods: boolean;
  captchaRenderId?: string;
  success: Callback;
  failure: Callback;
};

declare global {
  interface Window {
    initSendOTP?: (config: Msg91WidgetConfig) => void;
    sendOtp?: (identifier: string, ok?: Callback, fail?: Callback) => void;
    retryOtp?: (
      channel: string | null,
      ok?: Callback,
      fail?: Callback
    ) => void;
    verifyOtp?: (otp: number | string, ok?: Callback, fail?: Callback) => void;
    getWidgetData?: () => unknown;
    isCaptchaVerified?: () => boolean;
  }
}

export type OtpWidgetSettings = {
  /** Digits in the code. Configured in the MSG91 dashboard. */
  otpLength: number;
  /** Seconds the learner must wait before asking for another code. */
  retryTimeSec: number;
  /** How many times a code may be re-sent. */
  retryCount: number;
};

/** Used until (or unless) the widget reports its own settings. */
export const DEFAULT_OTP_SETTINGS: OtpWidgetSettings = {
  otpLength: 4,
  retryTimeSec: 60,
  retryCount: 2,
};

const CALL_TIMEOUT_MS = 25_000;
const READY_TIMEOUT_MS = 5_000;

export const OTP_GENERIC_ERROR =
  "That didn’t work. Please try again in a moment.";

let scriptPromise: Promise<void> | null = null;

/** Load the MSG91 script once per page. */
export function loadOtpScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("No window"));
  }
  if (typeof window.initSendOTP === "function") {
    return Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = MSG91_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      scriptPromise = null;
      reject(new Error("Could not load phone verification."));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Start the widget in custom-UI mode. Safe to call again (for example after a
 * client-side navigation): the captcha container is cleared first so the
 * checkbox is never rendered twice.
 */
export function initOtpWidget(captchaElementId: string): void {
  const init = window.initSendOTP;
  if (typeof init !== "function") {
    throw new Error("Phone verification is not available.");
  }
  const container = document.getElementById(captchaElementId);
  if (container) container.innerHTML = "";

  init({
    widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
    tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH,
    identifier: "",
    exposeMethods: true,
    captchaRenderId: captchaElementId,
    // Results come back through each method's own callbacks. Handling the
    // config-level ones too would act on every event twice.
    success: () => undefined,
    failure: () => undefined,
  });
}

/** Resolve once the widget has attached its methods to `window`. */
export function waitForOtpMethods(
  timeoutMs: number = READY_TIMEOUT_MS
): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (
        typeof window.sendOtp === "function" &&
        typeof window.verifyOtp === "function" &&
        typeof window.retryOtp === "function"
      ) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("Phone verification did not start."));
        return;
      }
      window.setTimeout(check, 50);
    };
    check();
  });
}

function boundedInt(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
    ? value
    : null;
}

/** Code length and resend rules as configured in the MSG91 dashboard. */
export function readWidgetSettings(): OtpWidgetSettings {
  let data: unknown = null;
  try {
    data = window.getWidgetData?.() ?? null;
  } catch {
    data = null;
  }
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  return {
    otpLength:
      boundedInt(record.otpLength, 3, 8) ?? DEFAULT_OTP_SETTINGS.otpLength,
    retryTimeSec:
      boundedInt(record.retryTime, 10, 600) ??
      DEFAULT_OTP_SETTINGS.retryTimeSec,
    retryCount:
      boundedInt(record.retryCount, 0, 10) ?? DEFAULT_OTP_SETTINGS.retryCount,
  };
}

export function isCaptchaVerified(): boolean | undefined {
  try {
    return window.isCaptchaVerified?.();
  } catch {
    return undefined;
  }
}

/** MSG91 expects the country code without "+", e.g. 919876543210. */
export function toWidgetIdentifier(tenDigitMobile: string): string {
  return `91${tenDigitMobile.replace(/\D/g, "")}`;
}

function callWidget<T>(
  invoke: (ok: Callback, fail: Callback) => void,
  onSuccess: (value: unknown) => T
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject({ message: "This is taking too long. Please try again." });
    }, CALL_TIMEOUT_MS);

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      action();
    };

    try {
      invoke(
        (value) =>
          finish(() => {
            // A throw here must reject, not escape into the widget's own
            // callback and leave this promise pending forever.
            try {
              resolve(onSuccess(value));
            } catch (error) {
              reject(error);
            }
          }),
        (error) => finish(() => reject(error))
      );
    } catch (error) {
      finish(() => reject(error));
    }
  });
}

/** Ask MSG91 to send the first code. */
export function sendOtp(identifier: string): Promise<void> {
  const send = window.sendOtp;
  if (typeof send !== "function") {
    return Promise.reject({ message: "Phone verification is not ready." });
  }
  return callWidget(
    (ok, fail) => send(identifier, ok, fail),
    () => undefined
  );
}

/** Re-send the code over the widget's default channel (SMS). */
export function resendOtp(): Promise<void> {
  const retry = window.retryOtp;
  if (typeof retry !== "function") {
    return Promise.reject({ message: "Phone verification is not ready." });
  }
  return callWidget(
    (ok, fail) => retry(null, ok, fail),
    () => undefined
  );
}

/** MSG91 returns the access token in `message` on success. */
export function extractMsg91AccessToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const message = (data as { message?: unknown }).message;
  if (typeof message !== "string" || !message.trim()) return null;
  return message.trim();
}

/** Check the code. Resolves with the access token our API will verify. */
export function verifyOtpCode(code: string): Promise<string> {
  const verify = window.verifyOtp;
  if (typeof verify !== "function") {
    return Promise.reject({ message: "Phone verification is not ready." });
  }
  return callWidget(
    (ok, fail) => verify(code, ok, fail),
    (data) => {
      const token = extractMsg91AccessToken(data);
      if (!token) {
        throw { message: "We could not confirm that code. Please try again." };
      }
      return token;
    }
  );
}

/** A readable sentence from whatever shape the widget rejects with. */
export function otpErrorMessage(
  error: unknown,
  fallback: string = OTP_GENERIC_ERROR
): string {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error && typeof error === "object") {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
}

/** Reset module state between unit tests. */
export function resetOtpWidgetForTests(): void {
  scriptPromise = null;
}
