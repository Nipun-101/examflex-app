import { Suspense } from "react";
import { HomeContent } from "@/app/home-content";
import { MarketingLanding } from "@/components/landing/marketing-landing";

type HomePageProps = {
  searchParams: Promise<{ code?: string; error?: string; state?: string }>;
};

/**
 * Landing is the Suspense fallback (static shell). OAuth return / marketing
 * choice streams after searchParams resolve under Cache Components.
 */
export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<MarketingLanding />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
