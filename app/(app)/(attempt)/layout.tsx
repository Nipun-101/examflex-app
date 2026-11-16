import type { ReactNode } from "react";
import { AttemptShell } from "@/components/study/attempt-shell";

type AttemptLayoutProps = {
  children: ReactNode;
};

export default function AttemptLayout({ children }: AttemptLayoutProps) {
  return <AttemptShell>{children}</AttemptShell>;
}
