/** Offer on a catalog product. Amounts are in paise. */
export interface CatalogOffer {
  id: string;
  productId: string;
  durationPreset: string;
  currency: string;
  listAmount: number;
  saleAmount?: number;
  effectiveAmount?: number;
  status: string;
}

export interface CatalogProduct {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: string;
  offers: CatalogOffer[];
  coveredForLife: boolean;
  /** Omitted when the user has no payment row. `null` means lifetime. */
  ownedUntil?: string | null;
}

export interface CoveringProductsResult {
  products: CatalogProduct[];
  /** False when commerce is switched off; hide plans / pricing. */
  commerceEnabled: boolean;
}

export interface OfferListDiscount {
  listPaise: number;
  percentOff: number;
}
