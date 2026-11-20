import { ArrowRight, Star, UserRound } from "lucide-react";
import Link from "next/link";

const PATHS = [
  { name: "MBBS", note: "Medicine" },
  { name: "BDS", note: "Dentistry" },
  { name: "BVSc & AH", note: "Veterinary" },
] as const;

export function CareerSection() {
  return (
    <section className="container-x grid gap-4 py-6 lg:grid-cols-2 lg:gap-5">
      <article className="flex flex-col gap-4 rounded-[28px] bg-study-ink p-6 text-white md:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-study-lime">
          A little perspective
        </p>
        <h3 className="text-3xl font-extrabold leading-tight tracking-tight">
          See where you could go.
        </h3>
        <p className="text-[15px] leading-relaxed text-study-on-dark">
          Your score meets past cutoffs as a range, not a promise. Explore paths
          with your marks in mind.
        </p>
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {PATHS.map((path) => (
            <li
              key={path.name}
              className="rounded-2xl border border-dashed border-white/30 bg-white/10 p-3.5"
            >
              <b className="text-base">{path.name}</b>
              <p className="mt-0.5 text-xs text-study-on-dark">{path.note}</p>
            </li>
          ))}
        </ul>
      </article>

      <article className="relative flex flex-col gap-4 overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#0e2f29,#17594a_55%,#2c7f66)] p-6 text-white md:p-9">
        <div
          aria-hidden
          className="absolute -right-12 -top-14 h-[200px] w-[200px] rounded-full bg-study-bar-chemistry/50"
        />
        <span className="relative inline-flex items-center gap-1.5 self-start rounded-2xl bg-warning px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-study-ink">
          <Star className="h-3 w-3 fill-current" aria-hidden />
          Premium · 1:1 session
        </span>
        <h3 className="relative text-3xl font-extrabold leading-tight tracking-tight">
          Talk to someone who’s guided students for 10+ years.
        </h3>
        <div className="relative flex items-center gap-3.5">
          <span className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-full bg-study-lilac text-study-ink ring-4 ring-study-lime/70">
            <UserRound className="h-10 w-10" aria-hidden />
          </span>
          <p className="text-sm leading-relaxed text-study-on-dark">
            Doubts, career paths, colleges for your marks. Leave with a plan
            that’s yours.
          </p>
        </div>
        <Link
          href="/login"
          className="relative inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-warning px-6 text-[15px] font-bold text-study-ink shadow-[0_5px_0_rgba(0,0,0,0.18)] transition-[filter] hover:brightness-105"
        >
          Book my 1:1 session
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </article>
    </section>
  );
}
