import { apiFetch } from "@/lib/api/client";
import {
  networkApiFailure,
  type ApiResult,
} from "@/lib/api/parse-envelope";
import { parseProfileResponse } from "@/lib/api/users";
import type { ApiUserProfile } from "@/types/user";

const NETWORK_FAILURE =
  "Could not reach ExamFlex. Check your connection and try again.";

/**
 * Attach the number MSG91 just verified. The API reads the number from MSG91
 * using this token; the number is never sent from the browser.
 */
export async function verifyMyPhone(
  accessToken: string
): Promise<ApiResult<ApiUserProfile>> {
  try {
    const response = await apiFetch("/api/v1/users/me/phone/verify", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    });
    return parseProfileResponse(
      response,
      "We could not verify that number. Please try again."
    );
  } catch {
    return networkApiFailure(NETWORK_FAILURE);
  }
}

/** Save the learner's name and their one target exam and finish onboarding. */
export async function completeOnboarding(input: {
  name: string;
  targetExamId: string;
}): Promise<ApiResult<ApiUserProfile>> {
  try {
    const response = await apiFetch("/api/v1/users/me/onboarding", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return parseProfileResponse(
      response,
      "We could not save your details. Please try again."
    );
  } catch {
    return networkApiFailure(NETWORK_FAILURE);
  }
}
