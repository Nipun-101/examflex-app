import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <section className="flex flex-1 flex-col items-start gap-4 rounded-[20px] bg-white p-6 shadow-soft sm:p-8">
      <p className="text-[0.6875rem] font-semibold tracking-wide text-study-green uppercase">
        Coming soon
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-study-ink sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-xl text-base text-study-muted">{description}</p>
      <Link
        href="/today"
        className="mt-2 inline-flex h-[42px] items-center justify-center rounded-[10px] bg-study-ink px-5 text-sm font-medium text-white transition-colors hover:bg-study-green"
      >
        Back to Today
      </Link>
    </section>
  );
}
