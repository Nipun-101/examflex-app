import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EquationPagination } from "@/components/equation-book/equation-pagination";

describe("EquationPagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(
      <EquationPagination page={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables first/previous on page 1 and moves forward and to the end", () => {
    const onPageChange = vi.fn();
    render(
      <EquationPagination page={1} totalPages={5} onPageChange={onPageChange} />
    );
    expect(screen.getByText("Page 1 of 5")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "First page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Last page" }));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it("disables next/last on the final page and goes back", () => {
    const onPageChange = vi.fn();
    render(
      <EquationPagination page={5} totalPages={5} onPageChange={onPageChange} />
    );
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Last page" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "First page" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
