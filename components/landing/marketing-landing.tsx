import { CtaSection } from "@/components/landing/cta-section";
import { ExamsSection } from "@/components/landing/exams-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PerformanceSection } from "@/components/landing/performance-section";
import { TestsSection } from "@/components/landing/tests-section";

export function MarketingLanding() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <ExamsSection />
        <FeaturesSection />
        <TestsSection />
        <PerformanceSection />
        <CtaSection />
      </main>
      <LandingFooter />
    </>
  );
}
