const NAV_ITEMS = [
  { label: "Home", active: true },
  { label: "Practice", active: false },
  { label: "Mocks", active: false },
  { label: "Analysis", active: false },
] as const;

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-height)] max-w-lg grid-cols-4 px-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className="flex">
            <button
              type="button"
              disabled
              className={`flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                item.active ? "text-accent" : "text-muted"
              }`}
            >
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  item.active ? "bg-accent" : "bg-border"
                }`}
              />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
