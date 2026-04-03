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
    categoryName: "Mug",
    collectionName: "test-collection",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero vel magnam sint possimus eaque voluptatum alias culpa nesciunt quae necessitatibus. Excepturi corporis dicta dolor a necessitatibus totam quod ea consequatur?",
    productImages: [],
    basePrice: "500" as unknown as number,
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
