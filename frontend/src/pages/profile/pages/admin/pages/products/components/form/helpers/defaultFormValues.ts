import type {
  CreateProductInput,
  ProductWithRelations,
  UpdateProductInput,
} from "@TheCozyBud/types";

export function getEmptyFormKV(): CreateProductInput {
  return {
    name: "",
    price: "" as unknown as number,
    category: "",
    collectionName: "",
    description: "",
    colorVariants: [],
    productImages: [],
    primaryImageIndex: 0,
  };
}

export function getMappedUpdatingProductKV(
  updatingProduct: ProductWithRelations,
): Omit<UpdateProductInput, "productId"> {
  return {
    name: updatingProduct.name,
    price: updatingProduct.price,
    collectionName: updatingProduct.collectionName ?? "",
    description: updatingProduct.description ?? "",
    category: updatingProduct.categoryName ?? "",
    colorVariants: updatingProduct.colorVariants ?? [],
    newProductImages: [],
    imageUrlsToDelete: [],
    primaryImageIndex: updatingProduct.imageUrls.indexOf(
      updatingProduct.primaryImageUrl,
    ),
  };
}
