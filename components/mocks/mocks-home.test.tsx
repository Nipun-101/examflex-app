import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MocksHome } from "@/components/mocks/mocks-home";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";

const getExamsByCategory = vi.fn();
const push = vi.fn();
const searchParams = new URLSearchParams();

vi.mock("@/lib/api/exams", () => ({
  getExamsByCategory: (...args: unknown[]) => getExamsByCategory(...args),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/mocks",
  useSearchParams: () => searchParams,
}));

function renderHome() {
  return render(
    <StudyLoadingProvider>
      <MocksHome />
    </StudyLoadingProvider>
  );
}

const readyExam = {
  id: "ex1",
  title: "NEET UG",
  description: "Medical entrance",
  imageUrl: "",
  fullName: "Medical entrance",
  duration: "3h",
  totalQuestions: 180,
  totalMarks: 720,
  statsLabel: "180 QUESTIONS · 180 MINUTES · 720 MARKS · +4 / -1",
  testsCount: 1,
  paperCounts: { chapterWise: 1, fullMocks: 0, sprint: 0 },
  subjectsCount: 3,
  trending: true,
};

describe("MocksHome", () => {
  beforeEach(() => {
    getExamsByCategory.mockReset();
    push.mockReset();
    Array.from(searchParams.keys()).forEach((key) => searchParams.delete(key));
  });

  it("shows a category and exam cards after a successful load", async () => {
    getExamsByCategory.mockResolvedValue({
      ok: true,
      data: {
        categories: [
          {
            id: "c1",
            name: "NATIONAL TESTING AGENCY",
            shortName: "NTA",
            imageUrl: "/nta.png",
            description: "",
            exams: [readyExam],
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    renderHome();
    expect(screen.getByText("Loading mock exams...")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "NATIONAL TESTING AGENCY" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open NEET UG →" })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1/chapter-wise"
    );
    expect(screen.queryByRole("button", { name: "Next category" })).not.toBeInTheDocument();
    expect(getExamsByCategory).toHaveBeenCalledWith({ page: 1, limit: 1 });
  });

  it("shows the category pager when more pages exist", async () => {
    getExamsByCategory.mockResolvedValue({
      ok: true,
      data: {
        categories: [
          {
            id: "c1",
            name: "NTA",
            shortName: "NTA",
            imageUrl: "",
            description: "",
            exams: [readyExam],
          },
        ],
        pagination: {
          total: 2,
          page: 1,
          limit: 1,
          totalPages: 2,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    });

    renderHome();
    expect(await screen.findByRole("button", { name: "Next category" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Previous category" })).toBeDisabled();
    expect(screen.getByRole("note")).toHaveTextContent(/Category 1 of 2/);

    await userEvent.click(screen.getByRole("button", { name: "Next category" }));
    expect(push).toHaveBeenCalledWith("/mocks?page=2");
  });

  it("shows a retryable error", async () => {
    getExamsByCategory.mockResolvedValue({
      ok: false,
      message: "Could not load exams.",
    });
    renderHome();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load exams."
    );
    getExamsByCategory.mockResolvedValue({
      ok: true,
      data: {
        categories: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });
    await userEvent.click(screen.getByRole("button", { name: /Try again/ }));
    await waitFor(() =>
      expect(
        screen.getByText(/Mock exams will show up here once they are published/)
      ).toBeInTheDocument()
    );
  });
});
