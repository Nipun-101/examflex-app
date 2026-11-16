import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExamLayout from "@/app/(app)/(study)/mocks/exam/[id]/layout";
import { ExamHubLayoutClient } from "@/app/(app)/(study)/mocks/exam/[id]/exam-hub-layout-client";
import ExamOverviewPage, {
  metadata as overviewMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/page";
import ChapterWisePage, {
  metadata as chapterMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/chapter-wise/page";
import FullMocksPage, {
  metadata as fullMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/full-mocks/page";
import SprintTestsPage, {
  metadata as sprintMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/sprint-tests/page";

const useParams = vi.fn(() => ({ id: "6ac1335993fbfb809bc99def" }));

vi.mock("next/navigation", () => ({
  useParams: () => useParams(),
}));

vi.mock("@/components/mocks/exam-hub-shell", () => ({
  ExamHubShell: ({
    examId,
    children,
  }: {
    examId: string;
    children: React.ReactNode;
  }) => (
    <div data-testid="shell" data-exam-id={examId}>
      {children}
    </div>
  ),
}));
vi.mock("@/components/mocks/exam-overview", () => ({
  ExamOverview: () => <p>overview</p>,
}));
vi.mock("@/components/mocks/chapter-wise-list", () => ({
  ChapterWiseList: () => <p>chapter</p>,
}));
vi.mock("@/components/mocks/full-mocks-list", () => ({
  FullMocksList: () => <p>full</p>,
}));
vi.mock("@/components/mocks/sprint-tests-list", () => ({
  SprintTestsList: () => <p>sprint</p>,
}));

describe("exam hub routes", () => {
  it("layout wraps the client hub in Suspense", () => {
    render(
      <ExamLayout>
        <p>child</p>
      </ExamLayout>
    );
    expect(screen.getByTestId("shell")).toHaveAttribute(
      "data-exam-id",
      "6ac1335993fbfb809bc99def"
    );
    expect(screen.getByText("child")).toBeInTheDocument();
  });

  it("client layout passes a valid route id to the shell", () => {
    render(
      <ExamHubLayoutClient>
        <p>inner</p>
      </ExamHubLayoutClient>
    );
    expect(screen.getByTestId("shell")).toHaveAttribute(
      "data-exam-id",
      "6ac1335993fbfb809bc99def"
    );
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("shows a friendly message for invalid route ids", () => {
    useParams.mockReturnValueOnce({ id: "not-an-id" });
    render(
      <ExamHubLayoutClient>
        <p>inner</p>
      </ExamHubLayoutClient>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /exam link is invalid/i
    );
    expect(screen.queryByTestId("shell")).not.toBeInTheDocument();
  });

  it("waits when the route id is not ready yet", () => {
    useParams.mockReturnValueOnce({ id: undefined });
    render(
      <ExamHubLayoutClient>
        <p>inner</p>
      </ExamHubLayoutClient>
    );
    expect(screen.getByText("Loading exam...")).toBeInTheDocument();
    expect(screen.queryByTestId("shell")).not.toBeInTheDocument();
  });

  it("renders the overview", () => {
    render(<ExamOverviewPage />);
    expect(screen.getByText("overview")).toBeInTheDocument();
    expect(overviewMetadata.title).toBe("Exam overview");
  });

  it("renders Chapter Wise without awaiting params", () => {
    render(<ChapterWisePage />);
    expect(screen.getByText("chapter")).toBeInTheDocument();
    expect(chapterMetadata.title).toBe("Chapter Wise");
  });

  it("renders Full Mocks", () => {
    render(<FullMocksPage />);
    expect(screen.getByText("full")).toBeInTheDocument();
    expect(fullMetadata.title).toBe("Full Mocks");
  });

  it("renders Sprint Tests", () => {
    render(<SprintTestsPage />);
    expect(screen.getByText("sprint")).toBeInTheDocument();
    expect(sprintMetadata.title).toBe("Sprint Tests");
  });
});
