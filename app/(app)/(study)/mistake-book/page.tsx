import type { Metadata } from "next";
import { MistakeBookSessions } from "@/components/mistake-book/mistake-book-sessions";

export const metadata: Metadata = {
  title: "Mistake Book",
  description:
    "Review wrong and blank answers from your mocks, one paper at a time.",
};

export default function MistakeBookPage() {
  return <MistakeBookSessions />;
}
