import { isApiRecord, type ApiResult } from "@/lib/api/parse-envelope";
import {
  optionalField,
  parseList,
  readNumber,
  readString,
} from "@/lib/api/parse-fields";
import { requestParsed } from "@/lib/api/request";
import type {
  CatalogOffer,
  CatalogProduct,
  CoveringProductsResult,
  OfferListDiscount,
} from "@/types/catalog";

export function parseCatalogOffer(value: unknown): CatalogOffer | null {
  if (!isApiRecord(value)) return null;
  const listAmount = readNumber(value.listAmount);
  if (
    typeof value.id !== "string" ||
    typeof value.productId !== "string" ||
    typeof value.durationPreset !== "string" ||
    typeof value.currency !== "string" ||
    typeof value.status !== "string" ||
    listAmount === undefined
  ) {
    return null;
  }
  return {
    id: value.id,
    productId: value.productId,
    durationPreset: value.durationPreset,
    currency: value.currency,
    listAmount,
    status: value.status,
    ...optionalField("saleAmount", readNumber(value.saleAmount)),
    ...optionalField("effectiveAmount", readNumber(value.effectiveAmount)),
  };
}

export function parseCatalogProduct(value: unknown): CatalogProduct | null {
  if (!isApiRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.code !== "string" ||
    typeof value.name !== "string" ||
    typeof value.status !== "string"
  ) {
    return null;
  }
  const ownedUntil =
    value.ownedUntil === null ? null : readString(value.ownedUntil);
  return {
    id: value.id,
    code: value.code,
    name: value.name,
    status: value.status,
    offers: parseList(value.offers, parseCatalogOffer) ?? [],
    coveredForLife: value.coveredForLife === true,
    ...optionalField("description", readString(value.description)),
    ...optionalField("ownedUntil", ownedUntil),
  };
}

/** Parse `{ commerceEnabled?, data: CatalogProduct[] }` list envelopes. */
export function parseCoveringProducts(
  data: unknown,
  raw: unknown
): CoveringProductsResult | null {
  const products = parseList(data, parseCatalogProduct);
  if (!products) return null;
  return {
    products,
    commerceEnabled: !(isApiRecord(raw) && raw.commerceEnabled === false),
  };
}

/** Price the catalog says to charge, in paise. Prefers the server effective amount. */
export function offerPricePaise(offer: CatalogOffer): number | null {
  const amount = offer.effectiveAmount ?? offer.saleAmount ?? offer.listAmount;
  return Number.isFinite(amount) ? amount : null;
}

/**
 * List vs current selling price. Null when there is no real discount
 * (list not above the selling price, or list not positive).
 */
export function offerListDiscount(
  offer: CatalogOffer
): OfferListDiscount | null {
  const selling = offerPricePaise(offer);
  const listPaise = offer.listAmount;
  if (
    selling === null ||
    !Number.isFinite(listPaise) ||
    listPaise <= 0 ||
    listPaise <= selling
  ) {
    return null;
  }
  return {
    listPaise,
    percentOff: Math.floor(((listPaise - selling) / listPaise) * 100),
  };
}

/** Offers that have an id and a usable price. */
export function sellableOffers(product: CatalogProduct): CatalogOffer[] {
  return product.offers.filter(
    (offer) => Boolean(offer.id) && offerPricePaise(offer) !== null
  );
}

/** Products that cover an exam (EXAM and EXAM_GROUP grants) — View plans. */
export async function getProductsForExam(
  examId: string
): Promise<ApiResult<CoveringProductsResult>> {
  return requestParsed(
    `/api/v1/catalog/products/for-exam/${encodeURIComponent(examId)}`,
    { method: "GET" },
    parseCoveringProducts,
    "Could not load plans. Please try again."
  );
}

/** Products that cover one paper (MOCK_TEST, EXAM and EXAM_GROUP grants) — View plans. */
export async function getProductsForMockTest(
  mockTestId: string
): Promise<ApiResult<CoveringProductsResult>> {
  return requestParsed(
    `/api/v1/catalog/products/for-mock-test/${encodeURIComponent(mockTestId)}`,
    { method: "GET" },
    parseCoveringProducts,
    "Could not load plans. Please try again."
  );
}
