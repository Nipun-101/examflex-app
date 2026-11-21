import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/equation-book/browse",
  useSearchParams: () => new URLSearchParams(),
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
    const title = await screen.findByRole("heading", {
      name: "Net force on a free body?",
    });
    expect(title).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search by title/i)).toBeInTheDocument();

    // Grid items must shrink below intrinsic math width on mobile.
    expect(title.closest("li")).toHaveClass("min-w-0");
    expect(title).toHaveClass("break-words");
  });

  it("keeps long titles and equations inside the card bounds", async () => {
    vi.mocked(listEquations).mockResolvedValue({
      ok: true,
      data: {
        items: [
          {
            ...TEST_EQUATIONS[0]!,
            id: "eq-wide",
            title:
              "Hardy-Weinberg Equilibrium and Allele Frequencies Across Populations",
            shortDescription:
              "Mathematical relationship between allele frequencies and genotype frequencies in a population.",
            equation:
              "$$p + q = 1$$ $$p^2 + 2pq + q^2 = 1$$ $$f(AA)=p^2$$ $$f(Aa)=2pq$$ $$f(aa)=q^2$$",
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    render(<EquationBrowseView />);

    const title = await screen.findByRole("heading", {
      name: /Hardy-Weinberg Equilibrium and Allele Frequencies/i,
    });
    const card = title.closest("article");
    expect(card).not.toBeNull();
    expect(card).toHaveClass("min-w-0");
    expect(title).toHaveClass("break-words");
    expect(title.closest("li")).toHaveClass("min-w-0");
  });

  it("shows an equation's picture only when it has one", async () => {
    vi.mocked(listEquations).mockResolvedValue({
      ok: true,
      data: {
        items: [
          { ...TEST_EQUATIONS[0]!, imageUrl: "https://cdn/force-diagram.png" },
          TEST_EQUATIONS[1]!,
        ],
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

    render(<EquationBrowseView />);

    const withImage = (
      await screen.findByRole("heading", { name: "Net force on a free body?" })
    ).closest("article") as HTMLElement;
    const without = screen
      .getByRole("heading", { name: "Static friction limit?" })
      .closest("article") as HTMLElement;

    const picture = within(withImage).getByRole("img", {
      name: "Net force on a free body? illustration",
    });
    expect(picture).toHaveAttribute("src", "https://cdn/force-diagram.png");
    // fits its card instead of widening it
    expect(picture).toHaveClass("max-w-full", "max-h-60", "w-auto");
    expect(within(without).queryByRole("img")).not.toBeInTheDocument();
    expect(
      within(without).queryByRole("button", { name: /full size/ })
    ).not.toBeInTheDocument();

    // opens full size on request
    const user = userEvent.setup();
    await user.click(
      within(withImage).getByRole("button", {
        name: "View Net force on a free body? illustration full size",
      })
    );
    const dialog = screen.getByRole("dialog", { name: "Net force on a free body?" });
    expect(within(dialog).getByRole("img", { name: /full size/ })).toHaveAttribute(
      "src",
      "https://cdn/force-diagram.png"
    );
    expect(withImage).not.toContainElement(dialog);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
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
