import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getProductsForExam,
  getProductsForMockTest,
  offerListDiscount,
  offerPricePaise,
  parseCatalogOffer,
  parseCatalogProduct,
  parseCoveringProducts,
  sellableOffers,
} from "@/lib/api/catalog";
import type { CatalogOffer, CatalogProduct } from "@/types/catalog";

vi.mock("@/lib/auth/tokens", () => ({
  getAuthToken: () => "mem-token",
  refreshAccessToken: vi.fn(),
  removeAuthToken: vi.fn(),
}));

const offer: CatalogOffer = {
  id: "o1",
  productId: "p1",
  durationPreset: "MONTHS_12",
  currency: "INR",
  listAmount: 100000,
  saleAmount: 80000,
  effectiveAmount: 75000,
  status: "ACTIVE",
};

const product = {
  id: "p1",
  code: "NEET_PRO",
  name: "NEET Pro",
  description: "Everything for NEET",
  status: "ACTIVE",
  offers: [offer],
  coveredForLife: true,
  ownedUntil: null,
};

describe("parseCatalogOffer", () => {
  it("parses full and minimal offers", () => {
    expect(parseCatalogOffer(offer)).toEqual(offer);
    const { saleAmount: _s, effectiveAmount: _e, ...minimal } = offer;
    void _s;
    void _e;
    const parsed = parseCatalogOffer(minimal);
    expect(parsed).toEqual(minimal);
    expect(parsed).not.toHaveProperty("saleAmount");
  });

  it.each([
    ["not a record", null],
    ["id", { ...offer, id: 1 }],
    ["productId", { ...offer, productId: undefined }],
    ["durationPreset", { ...offer, durationPreset: 3 }],
    ["currency", { ...offer, currency: null }],
    ["status", { ...offer, status: 1 }],
    ["listAmount", { ...offer, listAmount: "1000" }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parseCatalogOffer(value)).toBeNull();
  });
});

describe("parseCatalogProduct", () => {
  it("parses a full product including lifetime ownership", () => {
    expect(parseCatalogProduct(product)).toEqual(product);
  });

  it("parses owned-until strings and minimal products", () => {
    expect(
      parseCatalogProduct({ ...product, ownedUntil: "2027-01-01T00:00:00Z" })
    ).toMatchObject({ ownedUntil: "2027-01-01T00:00:00Z" });

    const minimal = parseCatalogProduct({
      id: "p1",
      code: "C",
      name: "N",
      status: "ACTIVE",
      offers: [offer, null],
    });
    expect(minimal).toEqual({
      id: "p1",
      code: "C",
      name: "N",
      status: "ACTIVE",
      offers: [offer],
      coveredForLife: false,
    });
    expect(minimal).not.toHaveProperty("ownedUntil");
    expect(minimal).not.toHaveProperty("description");
    expect(
      parseCatalogProduct({ id: "p1", code: "C", name: "N", status: "A" })
    ).toMatchObject({ offers: [] });
  });

  it.each([
    ["not a record", null],
    ["id", { ...product, id: 1 }],
    ["code", { ...product, code: undefined }],
    ["name", { ...product, name: 2 }],
    ["status", { ...product, status: null }],
  ])("rejects invalid %s", (_label, value) => {
    expect(parseCatalogProduct(value)).toBeNull();
  });
});

describe("parseCoveringProducts", () => {
  it("reads commerceEnabled from the envelope", () => {
    expect(parseCoveringProducts([product], { commerceEnabled: true })).toEqual({
      products: [product],
      commerceEnabled: true,
    });
    expect(
      parseCoveringProducts([], { commerceEnabled: false })
    ).toEqual({ products: [], commerceEnabled: false });
    expect(parseCoveringProducts([], {})).toEqual({
      products: [],
      commerceEnabled: true,
    });
    expect(parseCoveringProducts([], null)).toEqual({
      products: [],
      commerceEnabled: true,
    });
  });

  it("rejects non-array data", () => {
    expect(parseCoveringProducts({}, {})).toBeNull();
  });
});

describe("offer pricing helpers", () => {
  it("prefers effective, then sale, then list price", () => {
    expect(offerPricePaise(offer)).toBe(75000);
    const { effectiveAmount: _e, ...noEffective } = offer;
    void _e;
    expect(offerPricePaise(noEffective)).toBe(80000);
    const { saleAmount: _s, ...listOnly } = noEffective;
    void _s;
    expect(offerPricePaise(listOnly)).toBe(100000);
    expect(offerPricePaise({ ...offer, effectiveAmount: Number.NaN })).toBeNull();
  });

  it("computes list discounts", () => {
    expect(offerListDiscount(offer)).toEqual({
      listPaise: 100000,
      percentOff: 25,
    });
  });

  it("returns null when there is no real discount", () => {
    expect(
      offerListDiscount({ ...offer, saleAmount: 100000, effectiveAmount: 100000 })
    ).toBeNull();
    expect(offerListDiscount({ ...offer, listAmount: 0 })).toBeNull();
    expect(offerListDiscount({ ...offer, listAmount: Number.NaN })).toBeNull();
    expect(
      offerListDiscount({ ...offer, effectiveAmount: Number.NaN })
    ).toBeNull();
  });

  it("filters sellable offers", () => {
    const p: CatalogProduct = {
      ...product,
      offers: [
        offer,
        { ...offer, id: "" },
        { ...offer, id: "o3", effectiveAmount: Number.NaN },
      ],
    };
    expect(sellableOffers(p)).toEqual([offer]);
  });
});

describe("getProductsForExam / getProductsForMockTest", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  it("loads products for an exam", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", commerceEnabled: true, data: [product] })
    );
    expect(await getProductsForExam("e 1")).toEqual({
      ok: true,
      data: { products: [product], commerceEnabled: true },
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/catalog/products/for-exam/e%201",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("loads products for a mock test", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: "ok", commerceEnabled: false, data: [] })
    );
    expect(await getProductsForMockTest("m1")).toEqual({
      ok: true,
      data: { products: [], commerceEnabled: false },
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3000/api/v1/catalog/products/for-mock-test/m1",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("returns API, malformed and network failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Exam not found" }, 404)
    );
    expect(await getProductsForExam("x")).toEqual({
      ok: false,
      status: 404,
      message: "Exam not found",
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ data: {} }));
    expect((await getProductsForMockTest("m1")).ok).toBe(false);

    vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    expect((await getProductsForMockTest("m1")).ok).toBe(false);
  });
});
