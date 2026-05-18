import type {
  CreateProductFormInput,
  ProductWithRelations,
  UpdateProductFormInput,
} from "@cozybud/schemas";

export function getCreateFormDefaultValues(): CreateProductFormInput {
  return {
    mode: "create",
    // name: "",
    // categoryName: "",
    // collectionName: "",
    // description: "",
    // productImages: [],
    // basePrice: "",
    // primaryImageIndex: 0,
    // options: [{ name: "", values: ["", ""] }],
    name: `product-${Math.floor(Math.random() * 100)}`,
    categoryName: "mug",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Libero vel magnam sint possimus eaque voluptatum alias culpa nesciunt quae necessitatibus. Excepturi corporis dicta dolor a necessitatibus totam quod ea consequatur?",
    productImages: [],
    basePrice: "500",
    primaryImageIndex: 0,
    options: [
      { name: "stem count", values: ["6", "12"] },
      { name: "main color", values: ["red", "yellow"] },
    ],
    variants: [],
  };
}

export function getUpdateFormDefaultValues(
  updatingProduct: ProductWithRelations,
): Omit<UpdateProductFormInput, "productId"> {
  const defaultPrimaryImageIndex = updatingProduct.imageUrls.indexOf(
    updatingProduct.primaryImageUrl,
  );

  return {
    mode: "update",
    name: updatingProduct.name,
    collectionName: updatingProduct.collectionName ?? "",
    description: updatingProduct.description ?? "",
    categoryName: updatingProduct.categoryName ?? "",
    newProductImages: [],
    imageUrlsToDelete: [],
    primaryImageIndex:
      defaultPrimaryImageIndex >= 0 ? defaultPrimaryImageIndex : 0,
    options: updatingProduct.options,
    variants: updatingProduct.variants.map((variant) => ({
      ...variant,
      priceCents: String(variant.priceCents / 100), // display as pesos
    })),
  };
}
