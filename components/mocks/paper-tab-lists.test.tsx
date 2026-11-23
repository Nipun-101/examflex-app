import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ChapterWiseList } from "@/components/mocks/chapter-wise-list";
import { FullMocksList } from "@/components/mocks/full-mocks-list";
import { SprintTestsList } from "@/components/mocks/sprint-tests-list";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";
import type { PaperListItemBase } from "@/types/mock-test";

const getMockTestsByExam = vi.fn();
const getFullMockTests = vi.fn();
const getSprintTests = vi.fn();
const getSubjectsForExam = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/mocks/exam/ex1",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/api/exams", () => ({
  getSubjectsForExam: (...args: unknown[]) => getSubjectsForExam(...args),
}));
vi.mock("@/lib/api/mock-tests", () => ({
  getMockTestsByExam: (...args: unknown[]) => getMockTestsByExam(...args),
}));
vi.mock("@/lib/api/full-mock-tests", () => ({
  getFullMockTests: (...args: unknown[]) => getFullMockTests(...args),
}));
vi.mock("@/lib/api/sprint-tests", () => ({
  getSprintTests: (...args: unknown[]) => getSprintTests(...args),
}));

const base: PaperListItemBase = {
  id: "p1",
  title: "Paper One",
  description: null,
  totalQuestions: 10,
  durationInMinutes: 20,
  marksPerQuestion: 4,
  negativeMarking: 1,
  passingScore: null,
  allowRetake: true,
  shuffleOptions: false,
  showResultsImmediately: true,
  isActive: true,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

const pagination = {
  total: 1,
  page: 1,
  limit: 12,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

function wrap(node: React.ReactNode) {
  return render(<StudyLoadingProvider>{node}</StudyLoadingProvider>);
}

describe("paper tab lists", () => {
  beforeEach(() => {
    getMockTestsByExam.mockReset();
    getFullMockTests.mockReset();
    getSprintTests.mockReset();
    getSubjectsForExam.mockReset();
    getSubjectsForExam.mockResolvedValue({ ok: true, data: [] });
  });

  it("Chapter Wise loads TOPIC_WISE papers for the exam", async () => {
    getMockTestsByExam.mockResolvedValue({
      ok: true,
      data: {
        data: [
          {
            ...base,
            exam: { id: "ex1", name: "NEET" },
            subject: { id: "s1", name: "Physics" },
            topic: { id: "t1", name: "Kinematics" },
            generationMode: "AUTO",
          },
        ],
        pagination,
      },
    });
    wrap(<ChapterWiseList examId="ex1" />);

    expect(
      await screen.findByRole("heading", { name: "Paper One" })
    ).toBeInTheDocument();
    // Redesigned cards surface subject/topic as the uppercase eyebrow.
    expect(screen.getByText("PHYSICS · KINEMATICS")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Chapter Wise" })
    ).toBeInTheDocument();
    expect(getMockTestsByExam).toHaveBeenCalledWith("ex1", {
      page: 1,
      limit: 12,
    });
    expect(getSubjectsForExam).toHaveBeenCalledWith("ex1");
  });

  it("Full Mocks loads papers for the exam", async () => {
    getFullMockTests.mockResolvedValue({
      ok: true,
      data: {
        data: [
          {
            ...base,
            exam: { id: "ex1", name: "NEET" },
            isSessionWise: true,
            subjectConfig: [],
          },
        ],
        pagination,
      },
    });
    wrap(<FullMocksList examId="ex1" />);

    expect(
      await screen.findByRole("heading", { name: "Paper One" })
    ).toBeInTheDocument();
    expect(screen.getByText("FULL MOCK")).toBeInTheDocument();
    expect(getFullMockTests).toHaveBeenCalledWith({
      examId: "ex1",
      page: 1,
      limit: 12,
    });
  });

  it("Rapid Rounds loads papers for the exam", async () => {
    getSprintTests.mockResolvedValue({
      ok: true,
      data: { data: [{ ...base, exam: null }], pagination },
    });
    wrap(<SprintTestsList examId="ex1" />);

    expect(
      await screen.findByRole("heading", { name: "Paper One" })
    ).toBeInTheDocument();
    expect(screen.getByText("RAPID ROUND")).toBeInTheDocument();
    expect(getSprintTests).toHaveBeenCalledWith({
      examId: "ex1",
      page: 1,
      limit: 12,
    });
  });

  it.each([
    ["Chapter Wise", getMockTestsByExam, <ChapterWiseList key="c" examId="ex1" />],
    ["Full Mocks", getFullMockTests, <FullMocksList key="f" examId="ex1" />],
    ["Rapid Rounds", getSprintTests, <SprintTestsList key="s" examId="ex1" />],
  ])("%s shows API errors", async (_name, mock, node) => {
    mock.mockResolvedValue({ ok: false, message: "Could not load" });
    wrap(node);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load");
  });
});
