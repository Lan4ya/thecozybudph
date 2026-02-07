import type {
  CreateProductInput,
  ProductWithRelationResponse,
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
  updatingProduct: ProductWithRelationResponse,
): Omit<UpdateProductInput, "productId"> {
  return {
    name: updatingProduct.name,
    price: updatingProduct.price,
    collectionName: updatingProduct.productCollections?.name ?? "",
    description: updatingProduct.description ?? "",
    category: updatingProduct.productCategories?.name ?? "",
    colorVariants: updatingProduct.colorVariants ?? [],
    newProductImages: [],
    imageUrlsToDelete: [],
    primaryImageIndex: updatingProduct.imageUrls.indexOf(
      updatingProduct.primaryImageUrl,
    ),
  };
}
