import isEqual from "fast-deep-equal";
import type {
  ProductFormInput,
  ProductVariant,
  ProductWithRelations,
} from "@TheCozyBud/schemas";

export function formHasChanges(
  values: ProductFormInput,
  updatingProduct: ProductWithRelations | null,
  stateOnlyValues?: {
    imagesToDelete?: string[];
    newSelectedFilesCount?: number;
    primaryImageIndex: number;
  },
): boolean {
  // CREATE MODE
  if (values.mode === "create") {
    const {
      name,
      basePrice,
      description,
      categoryName,
      productImages,
      collectionName,
    } = values;

    const noTextData =
      (!name || name.trim() === "") &&
      (!collectionName || collectionName.trim() === "") &&
      (!basePrice || Number(basePrice) === 0) &&
      (!description || description.trim() === "") &&
      (!categoryName || categoryName.trim() === "");

    const noImages =
      (!productImages || productImages.length === 0) &&
      (stateOnlyValues?.newSelectedFilesCount ?? 0) === 0;

    const hasChanges = !(noTextData && noImages);
    return hasChanges;
  }

  // UPDATE MODE
  if (!updatingProduct) return false;

  function normalizeVariants(variants: Partial<ProductVariant>[]) {
    return variants.map((v) => ({
      priceCents: v.priceCents,
      attributes: v.attributes,
    }));
  }

  const original = {
    name: updatingProduct.name,
    description: updatingProduct.description ?? "",
    categoryName: updatingProduct.categoryName ?? "",
    collectionName: updatingProduct.collectionName ?? "",
    primaryImageIndex:
      updatingProduct.imageUrls.indexOf(updatingProduct.primaryImageUrl) ?? 0,
    options: updatingProduct.options,
    variants: normalizeVariants(updatingProduct.variants),
  };

  const { name, description, variants, categoryName, collectionName } = values;

  const current = {
    name,
    description: description ?? "",
    categoryName: categoryName ?? "",
    collectionName: collectionName ?? "",
    primaryImageIndex: stateOnlyValues?.primaryImageIndex ?? 0,
    options: values.options,
    variants: normalizeVariants(variants ?? []),
  };

  // Compare main fields
  if (!isEqual(original, current)) {
    return true;
  }

  // If any image change occurred
  if (
    (stateOnlyValues?.imagesToDelete?.length ?? 0) > 0 ||
    (stateOnlyValues?.newSelectedFilesCount ?? 0) > 0
  ) {
    return true;
  }

  return false;
}
