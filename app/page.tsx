import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function HomePage() {
  return (
    <section className="flex flex-1 flex-col justify-center py-8 sm:py-16">
      <p className="animate-fade-up font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {APP_NAME}
      </p>
      <h1 className="animate-fade-up-delay mt-4 max-w-xl text-xl font-medium leading-snug text-foreground sm:text-2xl">
        Exam prep built for NEET &amp; JEE students.
      </h1>
      <p className="animate-fade-up-delay-2 mt-3 max-w-md text-base leading-relaxed text-muted sm:text-lg">
        {APP_TAGLINE}
      </p>
    </section>
  );
}
