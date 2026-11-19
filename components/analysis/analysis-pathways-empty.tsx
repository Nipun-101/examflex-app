const PLACEHOLDER_PATHWAYS = [
  { title: "Course pathway", width: "48%" },
  { title: "Course pathway", width: "62%" },
  { title: "Course pathway", width: "74%" },
] as const;

export function AnalysisPathwaysEmpty() {
  return (
    <div className="relative min-h-[14rem] overflow-hidden rounded-[16px] border border-dashed border-study-divider bg-white sm:min-h-[16rem]">
      <div
        className="pointer-events-none absolute inset-0 grid gap-3 p-4 opacity-35 sm:grid-cols-3 sm:p-5"
        aria-hidden
      >
        {PLACEHOLDER_PATHWAYS.map((pathway, index) => (
          <div
            key={`${pathway.title}-${index}`}
            className="h-fit rounded-[12px] border border-dashed border-study-divider px-3 py-3"
          >
            <p className="text-sm font-semibold text-study-ink">{pathway.title}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-study-mint">
              <div
                className="h-full rounded-full bg-study-green/60"
                style={{ width: pathway.width }}
              />
            </div>
            <p className="mt-2 text-[0.625rem] text-study-muted-soft">
              Outlook appears here
            </p>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex min-h-[14rem] items-center justify-center bg-white/55 px-5 py-8 backdrop-blur-[1.5px] sm:min-h-[16rem]">
        <div className="w-full max-w-md rounded-[16px] border border-study-divider/80 bg-white/90 px-5 py-5 text-center shadow-soft">
          <h3 className="font-display text-base font-semibold text-study-ink sm:text-lg">
            Pathway outlook available soon
          </h3>
          <p className="mt-2 text-sm leading-[1.45] text-study-muted-soft">
            Course pathways for this exam will show up here once they’re ready —
            then you can compare your full-mock average with each target.
          </p>
        </div>
      </div>
    </div>
  );
}
