import { updateMyProfile } from "@/lib/api/users";
import type { ApiResult } from "@/lib/api/parse-envelope";
import type { ApiUserProfile } from "@/types/user";

/** Persist the student's primary target exam so exam pickers stay quiet. */
export async function persistTargetExam(
  examId: string
): Promise<ApiResult<ApiUserProfile>> {
  return updateMyProfile({ targetExam: examId });
}
