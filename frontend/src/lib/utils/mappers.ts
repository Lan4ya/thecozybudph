import type {
  Database,
  Product,
  ProductOption,
  ProductWithRelations,
} from "@TheCozyBud/schemas";
import { parseDateString } from "./format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow =
  Database["public"]["Tables"]["product_variants"]["Row"];

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

type ProductWithRelationsRow = {
  created_at: string;
  description: string | null;
  id: string;
  image_urls: string[];
  max_price_cents: number;
  min_price_cents: number;
  name: string;
  options: any;
  primary_image_url: string;
  updated_at: string;
  product_variants: {
    attributes: any;
    id: string;
    price_cents: number;
  }[];
  product_categories?: { name: string } | null;
  product_collections?: { name: string } | null;
};

export function mapProductAndRelationsRowToProductWithRelationsDomain(
  row: ProductWithRelationsRow,
): ProductWithRelations {
  return {
    id: row.id,
    name: row.name,
    description: row.description,

    imageUrls: row.image_urls,
    primaryImageUrl: row.primary_image_url,

    options: (row.options ?? []) as ProductOption[],

    variants: row.product_variants.map((v) => ({
      id: v.id,
      priceCents: v.price_cents,
      attributes: v.attributes as Record<string, string>,
    })),

    minPriceCents: row.min_price_cents,
    maxPriceCents: row.max_price_cents,

    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),

    categoryName: row.product_categories?.name ?? null,
    collectionName: row.product_collections?.name ?? null,
  };
}
