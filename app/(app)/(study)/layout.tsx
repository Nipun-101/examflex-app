import type { ReactNode } from "react";
import { StudyShell } from "@/components/study/study-shell";

type StudyLayoutProps = {
  children: ReactNode;
};

export default function StudyLayout({ children }: StudyLayoutProps) {
  return <StudyShell>{children}</StudyShell>;
}
