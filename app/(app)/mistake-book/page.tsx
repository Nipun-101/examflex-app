import type { Metadata } from "next";
import { MistakeBookView } from "@/components/mistake-book/mistake-book-view";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";

export const metadata: Metadata = {
  title: "Mistake Book",
  description:
    "Review saved mock mistakes one card at a time — static Mistake Book until the API is connected.",
};

export default function MistakeBookPage() {
  return <MistakeBookView data={MISTAKE_BOOK_DATA} />;
}
