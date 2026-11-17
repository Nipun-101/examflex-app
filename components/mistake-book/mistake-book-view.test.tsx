import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MistakeBookView } from "@/components/mistake-book/mistake-book-view";
import { MISTAKE_BOOK_DATA } from "@/lib/mistake-book/static-data";
import { mathpixModuleStub } from "@/test-utils/mock-mathpix";

vi.mock("mathpix-markdown-it", () => mathpixModuleStub());

describe("MistakeBookView", () => {
  it("renders the seed mistake and supports trip tagging", async () => {
    const user = userEvent.setup();
    render(<MistakeBookView data={MISTAKE_BOOK_DATA} />);

    expect(
      screen.getByRole("heading", { name: "Mistake Book" })
    ).toBeInTheDocument();
    expect(screen.getByText(/5 mistakes remaining/i)).toBeInTheDocument();
    expect(screen.getByText("1 of 5 mistakes")).toBeInTheDocument();
    expect(
      screen.getAllByText(/rough incline/i).length
    ).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: "Calculation" }));
    expect(
      screen.getByRole("button", { name: "Calculation" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("pages between mistakes and removes the active one", async () => {
    const user = userEvent.setup();
    render(<MistakeBookView data={MISTAKE_BOOK_DATA} />);

    await user.click(screen.getByRole("button", { name: /Next/i }));
    expect(
      screen.getAllByText(/minimum force to move it/i).length
    ).toBeGreaterThanOrEqual(1);

    await user.click(screen.getByRole("button", { name: /Previous/i }));
    expect(
      screen.getAllByText(/rough incline/i).length
    ).toBeGreaterThanOrEqual(1);

    await user.click(
      screen.getByRole("button", { name: /Understood · remove from book/i })
    );
    expect(screen.getByText(/4 mistakes remaining/i)).toBeInTheDocument();
    expect(
      screen.getAllByText(/minimum force to move it/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("filters by subject and chapter", async () => {
    const user = userEvent.setup();
    render(<MistakeBookView data={MISTAKE_BOOK_DATA} />);

    await user.selectOptions(screen.getByLabelText("Subject"), "biology");
    expect(screen.getByText(/1 mistake remaining/i)).toBeInTheDocument();
    expect(screen.getAllByText(/DNA content/i).length).toBeGreaterThanOrEqual(
      1
    );

    await user.selectOptions(screen.getByLabelText("Subject"), "physics");
    await user.selectOptions(
      screen.getByLabelText("Chapter"),
      "work-energy-power"
    );
    expect(screen.getByText(/dot product/i)).toBeInTheDocument();
  });

  it("jumps from the review rail", async () => {
    const user = userEvent.setup();
    render(<MistakeBookView data={MISTAKE_BOOK_DATA} />);

    await user.click(screen.getByRole("button", { name: /Q22/i }));
    expect(screen.getByText(/reaction quotient/i)).toBeInTheDocument();
  });

  it("shows an empty state when every filtered mistake is cleared", async () => {
    const user = userEvent.setup();
    render(<MistakeBookView data={MISTAKE_BOOK_DATA} />);

    await user.selectOptions(screen.getByLabelText("Subject"), "biology");
    await user.click(
      screen.getByRole("button", { name: /Understood · remove from book/i })
    );

    expect(
      screen.getByText(/No mistakes left in this filter/i)
    ).toBeInTheDocument();
  });

  it("renders empty copy when there is no seed data", () => {
    render(
      <MistakeBookView
        data={{
          ...MISTAKE_BOOK_DATA,
          mistakes: [],
        }}
      />
    );

    expect(
      screen.getByText(/No mistakes left in this filter/i)
    ).toBeInTheDocument();
  });
});

