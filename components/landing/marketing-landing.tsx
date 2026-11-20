import { GoogleSignInPrompt } from "@/components/auth/google-sign-in-prompt";
import { CareerSection } from "@/components/landing/career-section";
import { CtaSection } from "@/components/landing/cta-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PerformanceSection } from "@/components/landing/performance-section";
import { TestsSection } from "@/components/landing/tests-section";
import { ToolsSection } from "@/components/landing/tools-section";

export function MarketingLanding() {
  return (
    <>
      <LandingHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <TestsSection />
        <ToolsSection />
        <PerformanceSection />
        <CareerSection />
        <CtaSection />
      </main>
      <LandingFooter />
      <GoogleSignInPrompt />
    </>
  );
}
