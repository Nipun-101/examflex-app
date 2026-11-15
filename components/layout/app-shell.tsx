import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden"
      >
        <div className="ambient-blob absolute -left-16 top-8 h-56 w-56 rounded-full bg-accent-soft blur-3xl" />
        <div className="ambient-blob absolute -right-10 top-24 h-64 w-64 rounded-full bg-[#dbeafe] blur-3xl [animation-delay:1.5s]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.85),_transparent_65%)]" />
      </div>

      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1.5rem)] pt-6 sm:px-6 md:pb-10">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
