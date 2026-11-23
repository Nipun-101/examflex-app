import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ExamLayout from "@/app/(app)/(study)/mocks/exam/[id]/layout";
import { ExamHubLayoutClient } from "@/app/(app)/(study)/mocks/exam/[id]/exam-hub-layout-client";
import ExamHubIndexPage, {
  metadata as hubMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/page";
import ChapterWisePage, {
  metadata as chapterMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/chapter-wise/page";
import FullMocksPage, {
  metadata as fullMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/full-mocks/page";
import SprintTestsPage, {
  metadata as sprintMetadata,
} from "@/app/(app)/(study)/mocks/exam/[id]/rapid-rounds/page";

const useParams = vi.fn(() => ({ id: "6ac1335993fbfb809bc99def" }));
const redirect = vi.fn((href: string) => {
  throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock("next/navigation", () => ({
  useParams: () => useParams(),
  usePathname: () => "/mocks/exam/6ac1335993fbfb809bc99def",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  redirect: (href: string) => redirect(href),
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
  });

  it("shows a friendly message for invalid route ids and keeps children mounted", () => {
    useParams.mockReturnValueOnce({ id: "not-an-id" });
    render(
      <ExamHubLayoutClient>
        <p>inner</p>
      </ExamHubLayoutClient>
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /exam link is invalid/i
    );
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("keeps children mounted when the route id is briefly missing", () => {
    useParams.mockReturnValueOnce({});
    render(
      <ExamHubLayoutClient>
        <p>inner</p>
      </ExamHubLayoutClient>
    );
    expect(screen.getByText("inner")).toBeInTheDocument();
  });

  it("redirects the hub root to chapter-wise", async () => {
    await expect(
      ExamHubIndexPage({
        params: Promise.resolve({ id: "6ac1335993fbfb809bc99def" }),
      })
    ).rejects.toThrow(
      "NEXT_REDIRECT:/mocks/exam/6ac1335993fbfb809bc99def/chapter-wise"
    );
    expect(hubMetadata.title).toBe("Chapter Wise");
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

  it("renders Rapid Rounds", () => {
    render(<SprintTestsPage />);
    expect(screen.getByText("sprint")).toBeInTheDocument();
    expect(sprintMetadata.title).toBe("Rapid Rounds");
  });
});
