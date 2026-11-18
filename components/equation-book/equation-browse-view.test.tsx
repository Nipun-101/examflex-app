import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/api/users", () => ({
  getMyProfile: vi.fn(),
}));
vi.mock("@/lib/equation-book/list-show-in-app-exams", () => ({
  listShowInAppExams: vi.fn(),
}));
vi.mock("@/lib/api/exams", () => ({
  getSubjectsForExam: vi.fn(),
}));
vi.mock("@/lib/api/equation-book", () => ({
  listEquations: vi.fn(),
}));

import { getMyProfile } from "@/lib/api/users";
import { getSubjectsForExam } from "@/lib/api/exams";
import { listEquations } from "@/lib/api/equation-book";
import { listShowInAppExams } from "@/lib/equation-book/list-show-in-app-exams";
import { EquationBrowseView } from "@/components/equation-book/equation-browse-view";
import {
  TEST_EQUATIONS,
  TEST_EXAMS,
  TEST_SUBJECTS,
} from "@/lib/equation-book/test-fixtures";

describe("EquationBrowseView", () => {
  beforeEach(() => {
    vi.mocked(getMyProfile).mockResolvedValue({
      ok: true,
      data: {
        id: "u1",
        name: "Ada",
        email: "a@b.c",
        role: "student",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        targetExam: { id: "exam-neet", name: "NEET" },
      },
    });
    vi.mocked(listShowInAppExams).mockResolvedValue(TEST_EXAMS);
    vi.mocked(getSubjectsForExam).mockResolvedValue({
      ok: true,
      data: TEST_SUBJECTS,
    });
    vi.mocked(listEquations).mockResolvedValue({
      ok: true,
      data: {
        items: TEST_EQUATIONS,
        pagination: {
          total: 2,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });
  });

  it("lists searchable equation cards", async () => {
    render(<EquationBrowseView />);

    expect(
      await screen.findByRole("heading", { name: "Browse all equations" })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Net force on a free body?" })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by title/i)).toBeInTheDocument();
  });

  it("shows the equation book empty state when there is no data", async () => {
    vi.mocked(listEquations).mockResolvedValue({
      ok: true,
      data: {
        items: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<EquationBrowseView />);

    expect(
      await screen.findByRole("heading", {
        name: "Your deck is waiting for its first card.",
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/RECALL BEATS REREADING/i)).toBeInTheDocument();
    expect(screen.getByText(/IN THIS CHAPTER/i)).toBeInTheDocument();
  });
});
