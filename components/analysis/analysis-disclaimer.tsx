type AnalysisDisclaimerCardProps = {
  disclaimer: {
    title: string;
    body: string;
  };
};

export function AnalysisDisclaimerCard({
  disclaimer,
}: AnalysisDisclaimerCardProps) {
  return (
    <aside className="rounded-[12px] bg-study-mint px-3.5 py-3.5 sm:px-4 sm:py-4">
      <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
        {disclaimer.title}
      </p>
      <p className="mt-2 text-xs leading-[1.4] text-study-ink sm:text-[0.8125rem]">
        {disclaimer.body}
      </p>
    </aside>
  );
}
