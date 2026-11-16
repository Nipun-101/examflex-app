import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttemptResultPage, { metadata } from "./page";

vi.mock("@/components/attempt/attempt-result-client", () => ({
  AttemptResultClient: ({ attemptId }: { attemptId: string }) => (
    <div data-testid="client">{attemptId}</div>
  ),
}));

describe("attempt result page", () => {
  it("passes the route param to the client", async () => {
    render(await AttemptResultPage({ params: Promise.resolve({ attemptId: "att9" }) } as never));
    expect(screen.getByTestId("client")).toHaveTextContent("att9");
  });

  it("sets a title", () => {
    expect(metadata.title).toBe("Mock test results");
  });
});
