import isEqual from "fast-deep-equal";
import type { ProductDataWithJoins } from "@TheCozyBud/schema";
import type { ProductFormValues } from "../pages/products/components/form/Form";

export function formHasChanges(
  values: ProductFormValues,
  updatingProduct: ProductDataWithJoins | null,
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
      productImages,
      collectionName,
    } = values;

    const noTextData =
      (!name || name.trim() === "") &&
      (!collectionName || collectionName.trim() === "") &&
      (!price || Number(price) === 0) &&
      (!description || description.trim() === "") &&
      (!colorVariants || colorVariants.length === 0);

    const noImages =
      (!productImages || productImages.length === 0) &&
      (stateOnlyValues?.newSelectedFilesCount ?? 0) === 0;

    if (noTextData && noImages) return false;

    return true;
  }

  // --- UPDATE MODE ---
  if (!updatingProduct) return false;

  const { name, price, description, colorVariants, collectionName } = values;

  const original = {
    name: updatingProduct.name,
    price: updatingProduct.price,
    description: updatingProduct.description ?? "",
    colorVariants: updatingProduct.colorVariants ?? [],
    collectionName: updatingProduct.productsCollection?.name ?? "",
    primaryImageIndex: updatingProduct.imageUrls.indexOf(
      updatingProduct.primaryImageUrl,
    ),
  };

  const current = {
    name,
    price,
    description: description ?? "",
    colorVariants: colorVariants ?? [],
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
