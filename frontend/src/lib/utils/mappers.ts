import type {
  Product,
  ProductOption,
  ProductRow,
  ProductVariant,
} from "@TheCozyBud/types";
import { parseDateString } from "./format";

export const mapProductRowToProduct = (row: ProductRow): Product => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrls: row.image_urls,
    primaryImageUrl: row.primary_image_url,
    minPriceCents: row.min_price_cents,
    maxPriceCents: row.max_price_cents,
    createdAt: parseDateString(row.created_at),
    updatedAt: parseDateString(row.updated_at),
    options: (row.options ?? []) as ProductOption[],
    variants: (row.variants ?? []) as ProductVariant[],
  };
};
