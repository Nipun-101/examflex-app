import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuestionRenderGuard } from "@/components/attempt/question-render-guard";

function Boom(): never {
  throw new Error("bad question");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("QuestionRenderGuard", () => {
  it("renders children normally", () => {
    render(
      <QuestionRenderGuard>
        <p>ok</p>
      </QuestionRenderGuard>
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("shows the default fallback when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <QuestionRenderGuard>
        <Boom />
      </QuestionRenderGuard>
    );
    expect(
      screen.getByText("This question could not be displayed.")
    ).toBeInTheDocument();
  });

  it("shows a custom fallback", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <QuestionRenderGuard fallback={<p>custom</p>}>
        <Boom />
      </QuestionRenderGuard>
    );
    expect(screen.getByText("custom")).toBeInTheDocument();
  });
});
