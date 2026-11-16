import { GoogleOAuthReturn } from "@/components/auth/google-oauth-return";
import { MarketingLanding } from "@/components/landing/marketing-landing";

type HomeContentProps = {
  searchParams: Promise<{ code?: string; error?: string; state?: string }>;
};

/**
 * Awaits request searchParams (OAuth return) inside a Suspense boundary.
 */
export async function HomeContent({ searchParams }: HomeContentProps) {
  const params = await searchParams;
  const isGoogleReturn =
    typeof params.code === "string" || typeof params.error === "string";

  if (isGoogleReturn) {
    return <GoogleOAuthReturn />;
  }

  return <MarketingLanding />;
}
