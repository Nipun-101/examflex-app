import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MistakeBookSessionCard } from "@/components/mistake-book/mistake-book-session-card";

describe("MistakeBookSessionCard", () => {
  it("links into the session review route with title and count", () => {
    render(
      <MistakeBookSessionCard
        session={{
          mockTestId: "mt-9",
          attemptId: "at-9",
          title: "Kinematics - 1",
          paperType: "TOPIC_WISE",
          remainingCount: 9,
          attemptSubmittedAt: "2026-11-18T10:00:00.000Z",
          subjectId: "s1",
          subjectLabel: "Physics",
          topicId: "t1",
          topicLabel: "Kinematics",
          subjectIds: ["s1"],
        }}
      />
    );

    expect(
      screen.getByRole("link", { name: /Kinematics - 1/i })
    ).toHaveAttribute("href", "/mistake-book/mt-9");
    expect(screen.getAllByText("Chapter wise").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/9 mistakes|9/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Physics · Kinematics/i).length).toBeGreaterThan(
      0
    );
  });

  it("renders one dot per remaining mistake up to 180 in each layout", () => {
    const { container } = render(
      <MistakeBookSessionCard
        session={{
          mockTestId: "mt-full",
          attemptId: "at-full",
          title: "Full Mock",
          paperType: "FULL_EXAM",
          remainingCount: 180,
          attemptSubmittedAt: "2026-11-18T10:00:00.000Z",
          subjectLabel: "Physics",
          subjectIds: ["s1"],
        }}
      />
    );

    // Mobile (size-2) + desktop (size-1.5) trees both mount.
    expect(container.querySelectorAll(".rounded-full.size-2")).toHaveLength(180);
    expect(container.querySelectorAll(".rounded-full.size-1\\.5")).toHaveLength(
      180
    );
  });
});
