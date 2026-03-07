import type {
  ProductRow,
  ProductVariantRow,
  Product,
  ProductOption,
} from "@TheCozyBud/types";
import { parseDateString } from "./format";

type ProductWithVariants = ProductRow & {
  product_variants: Omit<ProductVariantRow, "product_id">[];
};

export const mapProductAndVariantsRowToProductDomain = (
  row: ProductWithVariants,
): Product => {
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
    variants:
      row.product_variants?.map((v) => ({
        id: v.id,
        priceCents: v.price_cents,
        attributes: v.attributes as Record<string, string>,
      })) ?? [],
  };
};
