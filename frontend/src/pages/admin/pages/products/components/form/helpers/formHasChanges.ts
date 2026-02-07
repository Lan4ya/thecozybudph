import isEqual from "fast-deep-equal";
import type { ProductWithRelationResponse } from "@TheCozyBud/types";
import type { ProductFormValues } from "../pages/products/components/form/Form";

export function formHasChanges(
  values: ProductFormValues,
  updatingProduct: ProductWithRelationResponse | null,
  stateOnlyValues?: {
    imagesToDelete?: string[];
    newSelectedFilesCount?: number;
    primaryImageIndex: number;
  },
): boolean {
  // --- CREATE MODE ---
  if (values.mode === "create") {
    const {
      name,
      price,
      description,
      colorVariants,
      category,
      productImages,
      collectionName,
    } = values;

    const noTextData =
      (!name || name.trim() === "") &&
      (!collectionName || collectionName.trim() === "") &&
      (!price || Number(price) === 0) &&
      (!description || description.trim() === "") &&
      (!category || category.trim() === "") &&
      (!colorVariants || colorVariants.length === 0);

    const noImages =
      (!productImages || productImages.length === 0) &&
      (stateOnlyValues?.newSelectedFilesCount ?? 0) === 0;

    if (noTextData && noImages) return false;

    return true;
  }

  // --- UPDATE MODE ---
  if (!updatingProduct) return false;

  const original = {
    name: updatingProduct.name,
    price: updatingProduct.price,
    description: updatingProduct.description ?? "",
    colorVariants: updatingProduct.colorVariants ?? [],
    category: updatingProduct.productCategories?.name ?? "",
    collectionName: updatingProduct.productCollections?.name ?? "",
    primaryImageIndex:
      updatingProduct.imageUrls.indexOf(updatingProduct.primaryImageUrl) ?? 0,
  };

  const { name, price, description, category, colorVariants, collectionName } =
    values;

  const current = {
    name,
    price,
    description: description ?? "",
    colorVariants: colorVariants ?? [],
    category: category ?? "",
    collectionName: collectionName ?? "",
    primaryImageIndex: stateOnlyValues?.primaryImageIndex ?? 0,
  };

  // Compare main fields
  if (!isEqual(original, current)) {
    // console.log("og", original);
    // console.log("cur", current);
    return true;
  }

  // If any image change occurred (add, remove)
  if (
    (stateOnlyValues?.imagesToDelete?.length ?? 0) > 0 ||
    (stateOnlyValues?.newSelectedFilesCount ?? 0) > 0
  ) {
    return true;
  }

  return false;
}
