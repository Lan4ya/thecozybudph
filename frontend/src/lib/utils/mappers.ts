import type {
  Database,
  Json,
  Product,
  ProductOption,
  ProductWithRelations,
} from "@cozybud/schemas";
import { parseDateString } from "./format";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type ProductVariantRow =
  Database["public"]["Tables"]["product_variants"]["Row"];

type ProductWithVariants = ProductRow & {
  product_variants: Omit<ProductVariantRow, "product_id">[];
};

// type ProductWithRelationsRow = {
//   created_at: string;
//   description: string | null;
//   id: string;
//   image_urls: string[];
//   max_price_cents: number;
//   min_price_cents: number;
//   name: string;
//   options: ProductOption[];
//   primary_image_url: string;
//   updated_at: string;
//   product_variants: {
//     attributes: ProductVariant["attributes"];
//     id: string;
//     price_cents: number;
//   }[];
//   product_categories?: { name: string } | null;
//   product_collections?: { name: string } | null;
// };

export const toProductDomain = (row: ProductWithVariants): Product => {
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

// export function toProductWithRelationsDomain(
//   row: ProductWithRelationsRow,
// ): ProductWithRelations {
//   return {
//     id: row.id,
//     name: row.name,
//     description: row.description,
//
//     imageUrls: row.image_urls,
//     primaryImageUrl: row.primary_image_url,
//
//     options: (row.options ?? []) as ProductOption[],
//
//     variants: row.product_variants.map((v) => ({
//       id: v.id,
//       priceCents: v.price_cents,
//       attributes: v.attributes as Record<string, string>,
//     })),
//
//     minPriceCents: row.min_price_cents,
//     maxPriceCents: row.max_price_cents,
//
//     createdAt: new Date(row.created_at),
//     updatedAt: new Date(row.updated_at),
//
//     categoryName: row.product_categories?.name ?? null,
//     collectionName: row.product_collections?.name ?? null,
//   };
// }
type ProductWithRelationsRow = {
  created_at: string;
  description: string | null;
  id: string;
  image_urls: string[];
  max_price_cents: number;
  min_price_cents: number;
  name: string;
  options: Json | null;
  primary_image_url: string;
  updated_at: string;
  product_variants: {
    attributes: Json | null; // ← Fix: Change to Json | null
    id: string;
    price_cents: number;
  }[];
  product_categories?: { name: string } | null;
  product_collections?: { name: string } | null;
};

const toAttributes = (attributes: Json | null): Record<string, string> => {
  if (!attributes) return {};
  if (typeof attributes === "object" && attributes !== null) {
    // Convert to Record<string, string>
    return Object.entries(attributes).reduce(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {} as Record<string, string>,
    );
  }
  return {};
};

const toProductOptions = (options: Json | null): ProductOption[] => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options as ProductOption[];
  }
  return [];
};

export function toProductWithRelationsDomain(
  row: ProductWithRelationsRow,
): ProductWithRelations {
  return {
    id: row.id,
    name: row.name,
    description: row.description,

    imageUrls: row.image_urls,
    primaryImageUrl: row.primary_image_url,

    options: toProductOptions(row.options),

    variants: row.product_variants.map((v) => ({
      id: v.id,
      priceCents: v.price_cents,
      attributes: toAttributes(v.attributes), // ← Use the helper
    })),

    minPriceCents: row.min_price_cents,
    maxPriceCents: row.max_price_cents,

    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),

    categoryName: row.product_categories?.name ?? null,
    collectionName: row.product_collections?.name ?? null,
  };
}
