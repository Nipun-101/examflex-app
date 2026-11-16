import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MocksHome } from "@/components/mocks/mocks-home";
import { StudyLoadingProvider } from "@/components/study/study-loading-provider";

const getExamsByCategory = vi.fn();

vi.mock("@/lib/api/exams", () => ({
  getExamsByCategory: () => getExamsByCategory(),
}));

function renderHome() {
  return render(
    <StudyLoadingProvider>
      <MocksHome />
    </StudyLoadingProvider>
  );
}

describe("MocksHome", () => {
  beforeEach(() => {
    getExamsByCategory.mockReset();
  });

  it("shows categories after a successful load", async () => {
    getExamsByCategory.mockResolvedValue({
      ok: true,
      data: [
        {
          id: "c1",
          name: "Medical",
          shortName: "MED",
          imageUrl: "/med.png",
          description: "Medical entrance",
          exams: [
            {
              id: "ex1",
              title: "NEET",
              fullName: "NEET UG",
              duration: "3h",
              totalQuestions: 180,
              totalMarks: 720,
              testsCount: 12,
              subjectsCount: 3,
              trending: false,
            },
          ],
        },
      ],
    });

    renderHome();
    expect(screen.getByText("Loading mock exams...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Medical" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /NEET/i })).toHaveAttribute(
      "href",
      "/mocks/exam/ex1"
    );
  });

  it("explains when categories exist but no exams are student-visible", async () => {
    getExamsByCategory.mockResolvedValue({
      ok: true,
      data: [
        {
          id: "c1",
          name: "Medical",
          shortName: "MED",
          imageUrl: "/med.png",
          description: "",
          exams: [],
        },
      ],
    });

    renderHome();
    expect(
      await screen.findByText(/Show in student app/i)
    ).toBeInTheDocument();
  });

  it("retries after an error", async () => {
    const user = userEvent.setup();
    getExamsByCategory
      .mockResolvedValueOnce({
        ok: false,
        message: "Could not load exams.",
      })
      .mockResolvedValueOnce({
        ok: true,
        data: [
          {
            id: "c1",
            name: "Medical",
            shortName: "MED",
            imageUrl: "/med.png",
            description: "",
            exams: [
              {
                id: "ex1",
                title: "NEET",
                fullName: "NEET UG",
                duration: null,
                totalQuestions: null,
                totalMarks: null,
                testsCount: 1,
                subjectsCount: 1,
                trending: false,
              },
            ],
          },
        ],
      });

    renderHome();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load exams."
    );
    await user.click(screen.getByRole("button", { name: /Try again/i }));
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Medical" })).toBeInTheDocument();
    });
  });
});
