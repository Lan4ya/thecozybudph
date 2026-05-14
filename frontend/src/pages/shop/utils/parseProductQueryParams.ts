import type {
  ProductQueryDomain,
  ProductPriceRangeOptionsUI,
  ProductSortOption,
} from "@/types";

export function parseProductQueryParams(
  params: URLSearchParams,
): ProductQueryDomain {
  const filters: ProductQueryDomain["filters"] = {};

  const search = params.get("search");
  if (search) filters.search = search;

  const categories = params.getAll("categories");
  if (categories.length) filters.categories = categories;

  const collectionNames = params.getAll("collectionNames");
  if (collectionNames.length) filters.collectionNames = collectionNames;

  const priceRange = params.get("priceRange");
  if (priceRange) filters.priceRange = priceRange as ProductPriceRangeOptionsUI;

  const sort = params.get("sort") as ProductSortOption | null;

  return {
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    sort: sort ?? "Popularity",
  };
}
