import { Suspense, type ReactElement } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttemptPage, { metadata } from "./page";

vi.mock("@/components/attempt/attempt-page-client", () => ({
  AttemptPageClient: ({ attemptId }: { attemptId: string }) => (
    <div data-testid="client">{attemptId}</div>
  ),
}));

vi.mock("@/components/study/study-route-loading", () => ({
  StudyRouteLoadingFallback: () => <div data-testid="loading-fallback" />,
}));

type AsyncChild = ReactElement<{ params: Promise<{ attemptId: string }> }> & {
  type: (props: {
    params: Promise<{ attemptId: string }>;
  }) => Promise<ReactElement>;
};

describe("attempt page", () => {
  it("reads the route param inside Suspense with the loading fallback", async () => {
    const page = AttemptPage({
      params: Promise.resolve({ attemptId: "att9" }),
    } as never) as ReactElement<{
      fallback: ReactElement;
      children: AsyncChild;
    }>;

    expect(page.type).toBe(Suspense);
    render(page.props.fallback);
    expect(screen.getByTestId("loading-fallback")).toBeInTheDocument();

    const child = page.props.children;
    render(await child.type(child.props));
    expect(screen.getByTestId("client")).toHaveTextContent("att9");
  });

  it("sets a title", () => {
    expect(metadata.title).toBe("Mock test");
  });
});
