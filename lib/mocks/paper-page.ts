import type { PaperCardData } from "@/lib/mocks/paper-card-model";
import type { MockTestsPagination } from "@/types/mock-test";

export const PAPER_PAGE_SIZE = 12;

export type PaperPage = {
  items: PaperCardData[];
  pagination: MockTestsPagination;
};

export type FetchPaperPage = (
  page: number
) => Promise<
  { ok: true; data: PaperPage } | { ok: false; message: string }
>;
