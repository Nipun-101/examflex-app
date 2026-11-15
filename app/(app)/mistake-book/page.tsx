import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/study/placeholder-page";

export const metadata: Metadata = {
  title: "Mistake Book",
};

export default function MistakeBookPage() {
  return (
    <PlaceholderPage
      title="Mistake Book"
      description="Saved mistakes and review sessions will live here. Static placeholder until the mistake book API is connected."
    />
  );
}
