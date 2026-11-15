import type {
  ProfilePrivacyNote,
  ProfileSnapshotStat,
} from "@/types/profile";

type ProfilePrepSnapshotProps = {
  title: string;
  subtitle: string;
  stats: readonly ProfileSnapshotStat[];
  privacyNote: ProfilePrivacyNote;
};

export function ProfilePrepSnapshot({
  title,
  subtitle,
  stats,
  privacyNote,
}: ProfilePrepSnapshotProps) {
  return (
    <aside className="flex flex-col gap-4 lg:gap-5">
      <section className="rounded-[18px] border border-study-divider bg-white p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold text-study-ink">
          {title}
        </h2>
        <p className="mt-1 text-[0.6875rem] font-medium text-study-muted-soft sm:text-xs">
          {subtitle}
        </p>

        <ul className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <li
              key={stat.id}
              className="rounded-[12px] bg-study-canvas px-3.5 py-3"
            >
              <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
                {stat.label}
              </p>
              <p className="mt-1.5 font-display text-xl font-semibold text-study-ink">
                {stat.value}
              </p>
              <p className="mt-1 text-[0.6875rem] text-study-muted-soft">
                {stat.hint}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[12px] bg-study-mint px-3.5 py-3.5 sm:px-4 sm:py-4">
        <p className="text-[0.625rem] font-semibold tracking-wide text-study-green uppercase">
          {privacyNote.title}
        </p>
        <p className="mt-2 text-xs leading-[1.4] text-study-ink sm:text-[0.8125rem]">
          {privacyNote.body}
        </p>
      </section>
    </aside>
  );
}
