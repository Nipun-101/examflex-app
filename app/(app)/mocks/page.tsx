import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/study/placeholder-page";

export const metadata: Metadata = {
  title: "Mocks",
};

export default function MocksPage() {
  return (
    <PlaceholderPage
      title="Mocks"
      description="Full-syllabus and chapter mocks will live here. Static placeholder until the mocks API is connected."
    />
  );
}
