import type { TargetExam } from "@/types";

export type SessionUser = {
  id: string;
  displayName: string;
  exam: TargetExam;
};

export type Session = {
  user: SessionUser;
};
