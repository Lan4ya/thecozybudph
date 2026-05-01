import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import { ProductOption } from "@TheCozyBud/schemas";

const ADJECTIVES = [
  "Silent",
  "Golden",
  "Velvet",
  "Misty",
  "Wild",
  "Sunny",
  "Soft",
  "Fresh",
  "Bold",
  "Pure",
  "Lush",
  "Calm",
];
const NOUNS = [
  "Bloom",
  "Petal",
  "Stem",
  "Blossom",
  "Orchid",
  "Tulip",
  "Rose",
  "Lily",
  "Daisy",
  "Vine",
];
const CATEGORIES = ["Vase", "Bouquet", "Mug"];
const COLLECTIONS = ["Spring Collection", "Mother's Day", "Valentine"];
const DESCRIPTIONS = [
  "Handcrafted using fresh seasonal flowers.",
  "Designed by professional florists.",
  "A timeless piece with natural elegance.",
  "Perfect for gifting or home decor.",
  "Minimal, modern, and beautifully arranged.",
];
const COLORS = ["Red", "Green", "Pink", "White"];
const STEM_COUNTS = [6, 12, 24];

type VariantInsert = {
  product_id: string;
  attributes: Record<string, string>;
  price_cents: number;
};

// deterministic product names
function generateProductNames(count: number): string[] {
  const names: string[] = [];
  outer: for (const adj of ADJECTIVES) {
    for (const noun of NOUNS) {
      names.push(`${adj} ${noun}`);
      if (names.length === count) break outer;
    }
  }
  if (names.length < count)
    throw new Error("Not enough adjective+noun combinations");
  return names;
}

function unsplash(seed: string) {
  return `https://source.unsplash.com/featured/800x800/?flowers,${seed}`;
}

async function main() {
  const seed = await createSeedClient({ dryRun: true });

  // Insert categories & collections once
  const { product_categories } = await seed.product_categories((x) =>
    x(CATEGORIES.length, ({ index }) => ({ name: CATEGORIES[index] })),
  );

  const { product_collections } = await seed.product_collections((x) =>
    x(COLLECTIONS.length, ({ index }) => ({ name: COLLECTIONS[index] })),
  );

  // Generate deterministic product names
  const PRODUCT_COUNT = 10;
  const PRODUCT_NAMES = generateProductNames(PRODUCT_COUNT);

  // Insert products
  const { products } = await seed.products((x) =>
    x(PRODUCT_COUNT, ({ seed: s, index }) => {
      const name = PRODUCT_NAMES[index];
      const colorCount = copycat.int(s + "colorCount", { min: 2, max: 3 });
      const stemCount = copycat.int(s + "stemCount", { min: 2, max: 3 });

      const options: ProductOption[] = [
        { name: "Color", values: COLORS.slice(0, colorCount) },
        {
          name: "Stem Count",
          values: STEM_COUNTS.slice(0, stemCount).map(String),
        },
      ];

      return {
        name,
        description: copycat.oneOf(s + "desc", DESCRIPTIONS),
        min_price_cents: 50000,
        max_price_cents: 200000,
        options: options as any, // JSONB
        primary_image_url: unsplash(name.replace(" ", "-")),
        image_urls: Array.from(
          { length: copycat.int(s + "imageCount", { min: 2, max: 4 }) },
          (_, i) => unsplash(`${name.replace(" ", "-")}-${i}`),
        ),
        product_category: (connect: any) =>
          connect({
            id: product_categories[
              copycat.int(s + "cat", { min: 0, max: CATEGORIES.length - 1 })
            ].id,
          }),
        product_collection: copycat.bool(s + "hasCollection")
          ? (connect: any) =>
              connect({
                id: product_collections[
                  copycat.int(s + "col", {
                    min: 0,
                    max: COLLECTIONS.length - 1,
                  })
                ].id,
              })
          : undefined,
      };
    }),
  );

  //  Generate variants
  for (const product of products) {
    const options = product.options as ProductOption[];
    const colorOption = options.find((o) => o.name === "Color");
    const stemOption = options.find((o) => o.name === "Stem Count");
    if (!colorOption || !stemOption) continue;

    const variants: VariantInsert[] = [];
    for (const color of colorOption.values) {
      for (const stem of stemOption.values) {
        variants.push({
          product_id: product.id!,
          attributes: { Color: color, "Stem Count": stem },
          price_cents: 50000 * (Number(stem) / 6),
        });
      }
    }

    await seed.product_variants((x) =>
      x(variants.length, ({ index }) => variants[index]),
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
