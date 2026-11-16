import type { Metadata } from "next";
import { FullMocksList } from "@/components/mocks/full-mocks-list";

export const metadata: Metadata = {
  title: "Full Mocks",
};

/** Sync server page — id comes from ExamPageProvider in the client layout. */
export default function FullMocksPage() {
  return <FullMocksList />;
}
