import type {
  CreateProductFormInput,
  ProductWithRelations,
  UpdateProductFormInput,
} from "@TheCozyBud/types";

export function getCreateFormDefaultValues(): CreateProductFormInput {
  return {
    mode: "create",
    // name: "",
    // categoryName: "",
    // collectionName: "",
    // description: "",
    // productImages: [],
    // basePrice: "" as unknown as number,
    // primaryImageIndex: 0,
    // options: [{ name: "", values: ["", ""] }],
    name: `test-product-${Math.floor(Math.random() * 1000)}`,
    categoryName: "mug",
    collectionName: "test-collection",
    description: "lorem ipsum dolor sit amet consectetur adipiscing elit",
    productImages: [],
    basePrice: "15000" as unknown as number,
    primaryImageIndex: 0,
    options: [
      { name: "stem count", values: ["6", "12"] },
      { name: "color", values: ["red-blue", "red-green"] },
    ],
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
