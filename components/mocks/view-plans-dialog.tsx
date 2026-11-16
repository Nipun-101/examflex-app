"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { StudyButton } from "@/components/study/study-button";
import { StudyLoadingOverlay } from "@/components/study/study-loading-overlay";
import {
  getProductsForExam,
  getProductsForMockTest,
  offerPricePaise,
} from "@/lib/api/catalog";
import { formatDurationPreset, formatPaiseAsRupees } from "@/lib/mocks/format";
import type { CatalogOffer, CatalogProduct } from "@/types/catalog";

type ViewPlansDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Plans covering every paper in this exam. */
  examId?: string;
  /** Plans covering this paper. Takes priority over `examId`. */
  mockTestId?: string;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      products: CatalogProduct[];
      commerceEnabled: boolean;
    };

export function ViewPlansDialog({
  open,
  onClose,
  examId,
  mockTestId,
}: ViewPlansDialogProps) {
  if (!open) return null;
  return createPortal(
    // Re-mounting per target resets the load state without effect-time resets.
    <PlansDialogBody
      key={mockTestId ?? examId ?? "none"}
      onClose={onClose}
      examId={examId}
      mockTestId={mockTestId}
    />,
    document.body
  );
}

type PlansDialogBodyProps = {
  onClose: () => void;
  examId: string | undefined;
  mockTestId: string | undefined;
};

function PlansDialogBody({
  onClose,
  examId,
  mockTestId,
}: PlansDialogBodyProps) {
  const [state, setState] = useState<LoadState>(
    mockTestId || examId
      ? { status: "loading" }
      : { status: "error", message: "No exam or paper selected for plans." }
  );

  useEffect(() => {
    const request = mockTestId
      ? getProductsForMockTest(mockTestId)
      : examId
        ? getProductsForExam(examId)
        : null;
    if (!request) return;
    let cancelled = false;
    void request.then((result) => {
      if (cancelled) return;
      setState(
        result.ok
          ? {
              status: "ready",
              products: result.data.products,
              commerceEnabled: result.data.commerceEnabled,
            }
          : { status: "error", message: result.message }
      );
    });
    return () => {
      cancelled = true;
    };
  }, [examId, mockTestId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-end bg-study-ink/40 p-0 sm:place-items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-plans-title"
        className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-[16px] bg-white p-5 sm:max-w-lg sm:rounded-[16px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id="view-plans-title"
              className="font-display text-xl font-semibold text-study-ink"
            >
              View plans
            </h2>
            <p className="mt-1 text-sm text-study-muted-soft">
              {mockTestId
                ? "Plans that unlock this test."
                : "Plans that unlock every test in this exam."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            autoFocus
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-study-muted-soft hover:bg-study-canvas"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {state.status === "loading" ? (
          <div className="relative mt-4 min-h-40">
            <StudyLoadingOverlay open scope="parent" label="Loading plans..." />
          </div>
        ) : null}

        {state.status === "error" ? (
          <p className="mt-4 text-sm text-study-ink" role="alert">
            {state.message}
          </p>
        ) : null}

        {state.status === "ready" ? (
          <PlansList
            products={state.products}
            commerceEnabled={state.commerceEnabled}
          />
        ) : null}

        <StudyButton
          variant="surface"
          className="mt-5 h-11 w-full rounded-[10px] text-sm font-semibold"
          onClick={onClose}
        >
          Close
        </StudyButton>
      </div>
    </div>
  );
}

type PricedOffer = { offer: CatalogOffer; price: number };

/** Offers the catalog can price, with the paise amount to charge. */
function pricedOffers(product: CatalogProduct): PricedOffer[] {
  return product.offers.flatMap((offer) => {
    const price = offerPricePaise(offer);
    return price === null ? [] : [{ offer, price }];
  });
}

function PlansList({
  products,
  commerceEnabled,
}: {
  products: CatalogProduct[];
  commerceEnabled: boolean;
}) {
  if (!commerceEnabled) {
    return (
      <p className="mt-4 text-sm text-study-muted-soft">
        Purchases are not available right now.
      </p>
    );
  }
  const rows = products
    .map((product) => ({ product, offers: pricedOffers(product) }))
    .filter((row) => row.offers.length > 0);
  if (rows.length === 0) {
    return (
      <p className="mt-4 text-sm text-study-muted-soft">
        No plans are available for this yet.
      </p>
    );
  }
  return (
    <ul className="mt-4 space-y-3">
      {rows.map(({ product, offers }) => (
        <li
          key={product.id}
          className="rounded-[12px] border border-study-divider px-3 py-3"
        >
          <p className="font-medium text-study-ink">{product.name}</p>
          {product.description ? (
            <p className="mt-1 text-xs text-study-muted-soft">
              {product.description}
            </p>
          ) : null}
          <ul className="mt-2 space-y-1 text-sm text-study-muted-soft">
            {offers.map(({ offer, price }) => (
              <li key={offer.id}>
                {formatDurationPreset(offer.durationPreset)} ·{" "}
                {formatPaiseAsRupees(price)}
              </li>
            ))}
          </ul>
          <OwnershipNote product={product} />
        </li>
      ))}
    </ul>
  );
}

function OwnershipNote({ product }: { product: CatalogProduct }) {
  if (product.coveredForLife || product.ownedUntil === null) {
    return (
      <p className="mt-2 text-xs text-study-green">
        You already have lifetime access.
      </p>
    );
  }
  if (product.ownedUntil) {
    const date = new Date(product.ownedUntil);
    const label = Number.isNaN(date.getTime())
      ? product.ownedUntil
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
    return (
      <p className="mt-2 text-xs text-study-green">Active until {label}.</p>
    );
  }
  return null;
}
