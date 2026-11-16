import type { Metadata } from "next";
import { EquationBookView } from "@/components/equation-book/equation-book-view";
import { EQUATION_BOOK_DATA } from "@/lib/equation-book/static-data";

export const metadata: Metadata = {
  title: "Equation Book",
  description:
    "Recall key NEET equations one card at a time — static Equation Book until the API is connected.",
};

export default function EquationBookPage() {
  return <EquationBookView data={EQUATION_BOOK_DATA} />;
}
