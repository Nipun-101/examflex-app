import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/study/placeholder-page";

export const metadata: Metadata = {
  title: "Equation Book",
};

export default function EquationBookPage() {
  return (
    <PlaceholderPage
      title="Equation Book"
      description="Due cards and recall practice will live here. Static placeholder until the equation book API is connected."
    />
  );
}
