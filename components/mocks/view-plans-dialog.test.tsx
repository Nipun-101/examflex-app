import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ViewPlansDialog } from "@/components/mocks/view-plans-dialog";
import type { CatalogProduct } from "@/types/catalog";

const getProductsForExam = vi.fn();
const getProductsForMockTest = vi.fn();

vi.mock("@/lib/api/catalog", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "@/lib/api/catalog"
  );
  return {
    ...actual,
    getProductsForExam: (id: string) => getProductsForExam(id),
    getProductsForMockTest: (id: string) => getProductsForMockTest(id),
  };
});

function product(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    id: "pr1",
    code: "NEET_ALL",
    name: "NEET all tests",
    description: "Everything",
    status: "ACTIVE",
    offers: [
      {
        id: "o1",
        productId: "pr1",
        durationPreset: "3M",
        currency: "INR",
        listAmount: 99900,
        effectiveAmount: 49900,
        status: "ACTIVE",
      },
      {
        id: "o2",
        productId: "pr1",
        durationPreset: "LIFETIME",
        currency: "INR",
        listAmount: 199900,
        status: "ACTIVE",
      },
    ],
    ...overrides,
  };
}

function ready(products: CatalogProduct[], commerceEnabled = true) {
  return { ok: true, data: { products, commerceEnabled } };
}

describe("ViewPlansDialog", () => {
  beforeEach(() => {
    getProductsForExam.mockReset();
    getProductsForMockTest.mockReset();
  });

  it("renders nothing when closed", () => {
    render(<ViewPlansDialog open={false} onClose={() => {}} mockTestId="t1" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(getProductsForMockTest).not.toHaveBeenCalled();
  });

  it("loads plans for a paper and formats prices", async () => {
    getProductsForMockTest.mockResolvedValue(ready([product()]));
    render(<ViewPlansDialog open onClose={() => {}} mockTestId="t1" />);

    expect(await screen.findByText("NEET all tests")).toBeInTheDocument();
    expect(getProductsForMockTest).toHaveBeenCalledWith("t1");
    expect(getProductsForExam).not.toHaveBeenCalled();
    expect(screen.getByText("Plans that unlock this test.")).toBeInTheDocument();
    expect(screen.getByText("Everything")).toBeInTheDocument();
    expect(screen.getByText(/3 months/)).toBeInTheDocument();
    expect(screen.getByText(/₹499/)).toBeInTheDocument();
    expect(screen.getByText("Lifetime · ₹1,999")).toBeInTheDocument();
  });

  it("loads plans for an exam", async () => {
    getProductsForExam.mockResolvedValue(ready([product({ description: "" })]));
    render(<ViewPlansDialog open onClose={() => {}} examId="ex1" />);

    expect(await screen.findByText("NEET all tests")).toBeInTheDocument();
    expect(getProductsForExam).toHaveBeenCalledWith("ex1");
    expect(
      screen.getByText("Plans that unlock every test in this exam.")
    ).toBeInTheDocument();
    expect(screen.queryByText("Everything")).not.toBeInTheDocument();
  });

  it("shows API errors", async () => {
    getProductsForMockTest.mockResolvedValue({ ok: false, message: "No plans" });
    render(<ViewPlansDialog open onClose={() => {}} mockTestId="t1" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("No plans");
  });

  it("explains when nothing is selected", () => {
    render(<ViewPlansDialog open onClose={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No exam or paper selected for plans."
    );
  });

  it("explains when purchases are off or no plans exist", async () => {
    getProductsForMockTest.mockResolvedValueOnce(ready([product()], false));
    const { unmount } = render(
      <ViewPlansDialog open onClose={() => {}} mockTestId="t1" />
    );
    expect(
      await screen.findByText("Purchases are not available right now.")
    ).toBeInTheDocument();
    unmount();

    getProductsForMockTest.mockResolvedValueOnce(
      ready([product({ offers: [] })])
    );
    render(<ViewPlansDialog open onClose={() => {}} mockTestId="t1" />);
    expect(
      await screen.findByText("No plans are available for this yet.")
    ).toBeInTheDocument();
  });

  it("skips offers the catalog cannot price", async () => {
    const base = product();
    getProductsForMockTest.mockResolvedValue(
      ready([
        {
          ...base,
          offers: [
            ...base.offers,
            {
              id: "o3",
              productId: "pr1",
              durationPreset: "6M",
              currency: "INR",
              listAmount: Number.NaN,
              status: "ACTIVE",
            },
          ],
        },
      ])
    );
    render(<ViewPlansDialog open onClose={() => {}} mockTestId="t1" />);
    expect(await screen.findByText(/₹499/)).toBeInTheDocument();
    expect(screen.getByText(/3 months/)).toBeInTheDocument();
    // product + two priced offers (NaN offer dropped)
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
  });

  it("shows ownership notes", async () => {
    getProductsForMockTest.mockResolvedValue(
      ready([
        product({ id: "a", coveredForLife: true }),
        product({ id: "b", ownedUntil: "2030-01-15T00:00:00.000Z" }),
        product({ id: "c", ownedUntil: "not-a-date" }),
        product({ id: "d", ownedUntil: null }),
      ])
    );
    render(<ViewPlansDialog open onClose={() => {}} mockTestId="t1" />);
    expect(
      (await screen.findAllByText("You already have lifetime access.")).length
    ).toBe(2);
    expect(screen.getByText(/Active until 15 Jan 2030/)).toBeInTheDocument();
    expect(screen.getByText("Active until not-a-date.")).toBeInTheDocument();
  });

  it("closes from the buttons, backdrop and Escape", async () => {
    const user = userEvent.setup();
    getProductsForMockTest.mockResolvedValue(ready([product()]));
    const onClose = vi.fn();
    render(<ViewPlansDialog open onClose={onClose} mockTestId="t1" />);
    await screen.findByText("NEET all tests");

    const dialog = screen.getByRole("dialog");
    await user.click(dialog);
    expect(onClose).not.toHaveBeenCalled();

    const [icon, text] = screen.getAllByRole("button", { name: "Close" });
    await user.click(icon as HTMLElement);
    await user.click(text as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(2);

    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(3);
    await user.keyboard("a");
    expect(onClose).toHaveBeenCalledTimes(3);

    await user.click(dialog.parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(4);
  });

  it("ignores a response that arrives after closing", async () => {
    let finish: (value: unknown) => void = () => {};
    getProductsForMockTest.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      })
    );
    const { rerender } = render(
      <ViewPlansDialog open onClose={() => {}} mockTestId="t1" />
    );
    rerender(<ViewPlansDialog open={false} onClose={() => {}} mockTestId="t1" />);
    finish(ready([product()]));
    await waitFor(() =>
      expect(screen.queryByText("NEET all tests")).not.toBeInTheDocument()
    );
  });
});
