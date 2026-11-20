import { SectionHeading } from "@/components/landing/section-heading";

const STATS = [
  { value: "548 / 720", label: "Latest mock" },
  { value: "+18", label: "vs Mock 11" },
  { value: "~14k to 19k", label: "Rank range (illustrative)" },
  { value: "19", label: "Mistakes to review" },
] as const;

const MOCKS = [
  { label: "Mock 10", score: 512, height: 100, current: false },
  { label: "Mock 11", score: 530, height: 124, current: false },
  { label: "Mock 12", score: 548, height: 150, current: true },
] as const;

const SUBJECTS = [
  { name: "Physics", score: 124, total: 180 },
  { name: "Chemistry", score: 140, total: 180 },
  { name: "Biology", score: 284, total: 360 },
] as const;

export function PerformanceSection() {
  return (
    <section id="performance" className="container-x scroll-mt-20 py-12 md:py-20">
      <div className="flex flex-col gap-6 rounded-[28px] bg-secondary p-5 sm:p-8 md:gap-7 md:rounded-[36px] md:p-11">
        <SectionHeading
          eyebrow="Performance"
          title="Know exactly where you stand"
          description="Every test turns into insights, so you always know what moves your score."
        />

        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col rounded-[18px] bg-study-mint p-[18px]">
              <dt className="order-2 mt-0.5 text-[13px] text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="font-display text-xl font-extrabold tracking-tight text-primary-deep sm:text-[28px]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="card-base rounded-[22px] p-5 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-bold">Mock test scores</h3>
              <span className="rounded-xl bg-study-mint px-3 py-1.5 text-xs font-semibold text-primary">
                +36 in 3 mocks
              </span>
            </div>
            <ul className="mt-4 flex items-end gap-4 sm:px-8">
              {MOCKS.map((mock) => (
                <li key={mock.label} className="flex-1 text-center">
                  <p className="text-sm font-semibold">{mock.score}</p>
                  <div
                    aria-hidden
                    className={`my-2 rounded-xl ${
                      mock.current ? "bg-primary" : "bg-study-mint-bar"
                    }`}
                    style={{ height: mock.height }}
                  />
                  <p className="text-xs text-muted-foreground">{mock.label}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-base flex flex-col gap-4 rounded-[22px] p-5 md:p-6">
            <h3 className="text-lg font-bold">Subject performance</h3>
            {SUBJECTS.map((subject) => (
              <div key={subject.name}>
                <div className="mb-1.5 flex justify-between text-sm font-medium">
                  <span>{subject.name}</span>
                  <b>
                    {subject.score} / {subject.total}
                  </b>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-study-mint">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.round((subject.score / subject.total) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <p className="rounded-[14px] bg-study-mint px-3.5 py-3 text-[13px] font-medium">
              Next up: force and friction need another look.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Illustrative data · No admission prediction
        </p>
      </div>
    </section>
  );
}
