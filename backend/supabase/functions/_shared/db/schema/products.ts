import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  jsonb,
  uniqueIndex,
  timestamp,
  check,
  integer,
} from "drizzle-orm/pg-core";

export const productCollections = pgTable("product_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

export const productCategories = pgTable("product_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
});

export const products = pgTable("products", {
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

  options: jsonb("options").notNull(),
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
});

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
  (table) => [
    uniqueIndex("product_variant_unique").on(table.productId, table.attributes),
    check("payments_amount_cents_check", sql`${table.priceCents} >= 0`),
  ],
);
