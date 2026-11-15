import { StudyNav } from "@/components/study/study-nav";

type StudyShellProps = {
  children: React.ReactNode;
};

export function StudyShell({ children }: StudyShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-study-canvas text-study-ink">
      <StudyNav />
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-8 lg:px-12 lg:pb-12 lg:pt-[2.125rem]">
        {children}
      </div>
    </div>
  );
}
