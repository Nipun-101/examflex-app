import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttemptPage, { metadata } from "./page";

vi.mock("@/components/attempt/attempt-page-client", () => ({
  AttemptPageClient: ({ attemptId }: { attemptId: string }) => (
    <div data-testid="client">{attemptId}</div>
  ),
}));

describe("attempt page", () => {
  it("passes the route param to the client", async () => {
    render(await AttemptPage({ params: Promise.resolve({ attemptId: "att9" }) } as never));
    expect(screen.getByTestId("client")).toHaveTextContent("att9");
  });

  it("sets a title", () => {
    expect(metadata.title).toBe("Mock test");
  });
});
