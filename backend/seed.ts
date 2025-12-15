import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";

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

const CATEGORIES = ["Vases", "Bouquets", "Mugs"];
const COLLECTIONS = ["Spring Collection", "Mother’s Day", "Valentine’s Day"];

const DESCRIPTIONS = [
  "Handcrafted using fresh seasonal flowers.",
  "Designed by professional florists.",
  "A timeless piece with natural elegance.",
  "Perfect for gifting or home decor.",
  "Minimal, modern, and beautifully arranged.",
];

const COLOR_VARIANTS = [
  ["Red", "White"],
  ["Pink", "Cream"],
  ["Yellow", "Orange"],
  ["White", "Green"],
  ["Purple", "Lavender"],
];

// Utils
function generateProductNames(count: number): string[] {
  const names: string[] = [];

  outer: for (const adj of ADJECTIVES) {
    for (const noun of NOUNS) {
      names.push(`${adj} ${noun}`);
      if (names.length === count) break outer;
    }
  }

  if (names.length < count) {
    throw new Error("Not enough adjective+noun combinations");
  }

  return names;
}

function unsplash(seed: string) {
  return `https://source.unsplash.com/featured/800x800/?flowers,${seed}`;
}

// Seed
async function main() {
  const seed = await createSeedClient({ dryRun: true });

  await seed.product_categories((x) =>
    x(CATEGORIES.length, (ctx) => ({
      name: CATEGORIES[ctx.index],
    })),
  );

  await seed.product_collections((x) =>
    x(COLLECTIONS.length, (ctx) => ({
      name: COLLECTIONS[ctx.index],
    })),
  );

  const PRODUCT_COUNT = 50;
  const PRODUCT_NAMES = generateProductNames(PRODUCT_COUNT);

  await seed.products((x) =>
    x(PRODUCT_COUNT, (ctx) => {
      const name = PRODUCT_NAMES[ctx.index];
      const imageCount = copycat.int(ctx.seed, { min: 2, max: 4 });

      return {
        name,
        description: copycat.oneOf(ctx.seed + "desc", DESCRIPTIONS),

        // price in cents
        price: copycat.int(ctx.seed + "price", {
          min: 2999,
          max: 12999,
        }),

        color_variants: copycat.oneOf(ctx.seed + "colors", COLOR_VARIANTS),

        primary_image_url: unsplash(name.replace(" ", "-")),
        image_urls: Array.from({ length: imageCount }, (_, i) =>
          unsplash(`${name.replace(" ", "-")}-${i}`),
        ),

        // FK Relations
        product_category: (connect) =>
          connect({
            id: seed.$store.product_categories[
              copycat.int(ctx.seed + "cat", {
                min: 0,
                max: CATEGORIES.length - 1,
              })
            ].id,
          }),

        product_collection: copycat.bool(ctx.seed + "hasCollection")
          ? (connect) =>
              connect({
                id: seed.$store.product_collections[
                  copycat.int(ctx.seed + "col", {
                    min: 0,
                    max: COLLECTIONS.length - 1,
                  })
                ].id,
              })
          : undefined,
      };
    }),
  );

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
