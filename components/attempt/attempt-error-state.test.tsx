import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttemptErrorState } from "@/components/attempt/attempt-error-state";

describe("AttemptErrorState", () => {
  it("shows title, message and actions with a default icon", () => {
    render(
      <AttemptErrorState
        title="Oops"
        message="Something broke"
        actions={<button type="button">Retry</button>}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Oops" })).toBeInTheDocument();
    expect(screen.getByText("Something broke")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("accepts a custom icon", () => {
    render(
      <AttemptErrorState
        title="T"
        message="M"
        icon={<span data-testid="icon" />}
        actions={null}
      />
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
