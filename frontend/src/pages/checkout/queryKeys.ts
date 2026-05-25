import type { Address } from "@cozybud/schemas";

export const createShippingQuoteQK = (address: Address | null) => [
  "shipping-quote",
  address,
];
