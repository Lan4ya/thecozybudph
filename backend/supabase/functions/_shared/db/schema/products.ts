import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
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

  // store collection/category IDs if needed
  productCollectionId: uuid("product_collection_id").references(
    () => productCollections.id,
    { onDelete: "set null" },
  ),
  productCategoryId: uuid("product_category_id").references(
    () => productCategories.id,
    { onDelete: "set null" },
  ),

  // store all options + values as JSONB
  options: jsonb("options").notNull(),
  /*
    Example:
    [
      { name: "Color", values: ["Red", "Green", "Blue"] },
      { name: "Stem Count", values: ["6", "12"] }
    ]
  */

  // store all variants as JSONB
  variants: jsonb("variants").notNull(),
  /*
    Example:
    [
      { sku: "flower-red-6", price_cents: 50000, options: { Color: "Red", "Stem Count": "6" } },
      { sku: "flower-red-12", price_cents: 100000, options: { Color: "Red", "Stem Count": "12" } }
    ]
  */

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
