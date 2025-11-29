import type {
  ProductQuery,
  PriceRangeOption,
  SortOption,
  Category,
} from "@/pages/shop/types";

export function parseQueryParams(params: URLSearchParams): ProductQuery {
  const filters: ProductQuery["filters"] = {};

  const search = params.get("search");
  if (search) filters.search = search;

  const categories = params.getAll("categories");
  if (categories.length) filters.categories = categories as Category[];

  const collectionName = params.getAll("collectionName");
  if (collectionName.length) filters.collectionName = collectionName;

  const priceRange = params.get("priceRange");
  if (priceRange) filters.priceRange = priceRange as PriceRangeOption;
  // if (priceRange) {
  //   try {
  //     filters.priceRange = JSON.parse(priceRange) as PriceRangeOption;
  //   } catch {
  //     // fallback: ignore invalid JSON
  //   }
  // }

  const sort = params.get("sort") as SortOption | null;

  return {
    filters: Object.keys(filters).length > 0 ? filters : {},
    sort: sort ?? undefined,
    page: 0,
    perPage: 12,
  };
}
