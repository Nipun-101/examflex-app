export type EquationNamedRef = {
  id: string;
  name: string;
};

export type EquationItem = {
  id: string;
  title: string;
  shortDescription: string;
  equation: string;
  longDescription?: string;
  mnemonic?: string;
  bulletPoints: string[];
  /** Pre-signed URL of the optional picture; absent when the equation has none. */
  imageUrl?: string;
  subject: EquationNamedRef;
  topic: EquationNamedRef;
  exams: EquationNamedRef[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EquationListPage = {
  items: EquationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type EquationExamOption = {
  id: string;
  name: string;
};

/** Static chrome copy for the recall session. */
export const EQUATION_BOOK_COPY = {
  title: "Equation Book",
  tagline: "Key equations. Clearer concepts.",
  eyebrow: "DON'T PEEK YET",
  revealedLabel: "LOCKED IN",
  browseLabel: "Just looking for a formula? Browse all  →",
  browseHref: "/equation-book/browse",
  filterHint: "Tap another subject or chapter to keep exploring.",
  emptyEyebrow: "Recall beats rereading",
  emptyTitle: "Your deck is waiting for its first card.",
  emptyBody:
    "Equations for each chapter show up here once they're published. Flip to recall, then lock it in. Key equations. Clearer concepts.",
} as const;
