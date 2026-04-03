import { sql } from "drizzle-orm";
import {
  check,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { ProductOption, ProductVariant } from "../../types/index.ts";
import { publicRole } from "../rls-roles.ts";

export const productCollections = pgTable(
  "product_collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
  },
  (_t) => [
    pgPolicy("allow public read", {
      as: "permissive",
      to: publicRole,
      for: "select",
      using: sql`true`,
    }),
  ],
);

export const productCategories = pgTable(
  "product_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull().unique(),
  },
  (_t) => [
    pgPolicy("allow public read", {
      as: "permissive",
      to: publicRole,
      for: "select",
      using: sql`true`,
    }),
  ],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrls: text("image_urls").array().notNull(),
    primaryImageUrl: text("primary_image_url").notNull(),
    minPriceCents: integer("min_price_cents").notNull(),
    maxPriceCents: integer("max_price_cents").notNull(),

    productCollectionId: uuid("product_collection_id").references(
      () => productCollections.id,
      { onDelete: "set null" },
    ),
    productCategoryId: uuid("product_category_id").references(
      () => productCategories.id,
      { onDelete: "set null" },
    ),

    options: jsonb("options").$type<ProductOption[]>().notNull(),
    /*
    Example:
    [
      { name: "Color", values: ["Red", "Green", "Blue"] },
      { name: "Stem Count", values: ["6", "12"] }
    ]
  */

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (_t) => [
    pgPolicy("allow public read", {
      as: "permissive",
      to: publicRole,
      for: "select",
      using: sql`true`,
    }),
  ],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull().default(0),
    // e.g: { Color: "Red", "Stem Count": "6" },
    // variants can have different prices depending on configuration. say stem
    // count is 12, then price probably is double the price of stem count 6.
    attributes: jsonb("attributes")
      .$type<ProductVariant["attributes"]>()
      .notNull(),
  },
  (t) => [
    uniqueIndex("product_variant_unique").on(t.productId, t.attributes),
    check("payments_amount_cents_check", sql`${t.priceCents} >= 0`),

    pgPolicy("allow public read", {
      as: "permissive",
      to: publicRole,
      for: "select",
      using: sql`true`,
    }),
  ],
);
