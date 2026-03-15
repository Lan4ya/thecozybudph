import type {
  ProductQueryDomain,
  ProductPriceRangeOption,
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

  const collectionName = params.getAll("collectionNames");
  if (collectionName.length) filters.collectionNames = collectionName;

  const priceRange = params.get("priceRange");
  if (priceRange) filters.priceRange = priceRange as ProductPriceRangeOption;

  const sort = params.get("sort") as ProductSortOption | null;

  return {
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    sort: sort ?? "Popularity",
  };
}
