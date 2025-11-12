import isEqual from "fast-deep-equal";
import type { FetchProductsResponse } from "@/types/api";
import type { ProductFormValues } from "../pages/products/components/form/Form";

export function formHasChanges(
  values: ProductFormValues,
  updatingProduct: FetchProductsResponse | null,
  extra?: {
    imagesToDelete?: string[];
    newSelectedFilesCount?: number;
    currentPrimaryImageIndex?: number;
  },
): boolean {
  // --- CREATE MODE ---
  if (values.mode === "create") {
    const {
      name,
      price,
      description,
      color_variants,
      product_images,
      collection_name,
    } = values;

    const noTextData =
      (!name || name.trim() === "") &&
      (!collection_name || collection_name.trim() === "") &&
      (!price || Number(price) === 0) &&
      (!description || description.trim() === "") &&
      (!color_variants || color_variants.length === 0);

    const noImages =
      (!product_images || product_images.length === 0) &&
      (extra?.newSelectedFilesCount ?? 0) === 0;

    if (noTextData && noImages) return false;

    return true;
  }

  // --- UPDATE MODE ---
  if (!updatingProduct) return false;

  const { name, price, description, color_variants, collection_name } = values;

  const original = {
    name: updatingProduct.name,
    price: updatingProduct.price,
    description: updatingProduct.description ?? "",
    color_variants: updatingProduct.color_variants ?? [],
    collection_name: updatingProduct.products_collection?.name ?? "",
  };

  const current = {
    name,
    price,
    description: description ?? "",
    color_variants: color_variants ?? [],
    collection_name: collection_name ?? "",
  };

  // Compare main fields
  if (!isEqual(original, current)) return true;

  // If any image change occurred (add, remove)
  if (
    (extra?.imagesToDelete?.length ?? 0) > 0 ||
    (extra?.newSelectedFilesCount ?? 0) > 0
  ) {
    return true;
  }

  // Check if primary image changed
  const originalPrimaryUrl = updatingProduct.primary_image_url ?? null;
  if (originalPrimaryUrl && extra?.currentPrimaryImageIndex !== undefined) {
    const displayImages = updatingProduct.image_urls ?? [];
    const newPrimaryUrl = displayImages[extra.currentPrimaryImageIndex] ?? null;
    if (newPrimaryUrl !== originalPrimaryUrl) return true;
  }

  return false;
}
