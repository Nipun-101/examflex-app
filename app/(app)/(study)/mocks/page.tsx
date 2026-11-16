import type { Metadata } from "next";
import { MocksHome } from "@/components/mocks/mocks-home";

export const metadata: Metadata = {
  title: "Mocks",
};

export default function MocksPage() {
  return <MocksHome />;
}
