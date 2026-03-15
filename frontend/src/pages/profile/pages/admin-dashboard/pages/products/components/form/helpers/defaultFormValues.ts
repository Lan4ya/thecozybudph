import type {
  CreateProductFormInput,
  ProductWithRelations,
  UpdateProductFormInput,
} from "@TheCozyBud/types";

export function getCreateFormDefaultValues(): CreateProductFormInput {
  return {
    mode: "create",
    name: "",
    categoryName: "",
    collectionName: "",
    description: "",
    productImages: [],
    basePrice: "" as unknown as number,
    primaryImageIndex: 0,
    options: [{ name: "", values: ["", ""] }],
    variants: [],
  };
}

export function getUpdateFormDefaultValues(
  updatingProduct: ProductWithRelations,
): Omit<UpdateProductFormInput, "productId"> {
  return {
    mode: "update",
    name: updatingProduct.name,
    collectionName: updatingProduct.collectionName ?? "",
    description: updatingProduct.description ?? "",
    categoryName: updatingProduct.categoryName ?? "",
    newProductImages: [],
    imageUrlsToDelete: [],
    primaryImageIndex: updatingProduct.imageUrls.indexOf(
      updatingProduct.primaryImageUrl,
    ),
    options: updatingProduct.options,
    variants: updatingProduct.variants,
  };
}
