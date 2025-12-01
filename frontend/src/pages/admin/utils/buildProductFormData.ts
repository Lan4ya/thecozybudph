import {
  capitalizeFirstLetter,
  capitalizeFirstLetterOfEachWord,
} from "@/lib/utils/format";
import type { CreateProductData, UpdateProductData } from "@TheCozyBud/schema";

type BuildOpts = {
  fields: CreateProductData | UpdateProductData;
  files?: File[];
  imageUrlsToDelete?: string[];
  isUpdate?: boolean;
  productId?: string;
  primaryImageIndex: number;
};

export function buildProductFormData(opts: BuildOpts) {
  const {
    fields,
    files = [],
    imageUrlsToDelete = [],
    isUpdate,
    productId,
    primaryImageIndex: primaryImageIndex,
  } = opts;

  const formData = new FormData();

  // ---- BASIC FIELDS ----
  if (fields.name !== undefined) formData.append("name", fields.name);

  if (fields.price !== undefined)
    formData.append("price", String(fields.price));

  if ((fields as any).collectionName)
    formData.append(
      "collectionName",
      capitalizeFirstLetterOfEachWord((fields as any).collectionName),
    );

  if ((fields as any).colorVariants)
    fields.colorVariants.forEach((color: string) =>
      formData.append("colorVariants", color),
    );

  if ((fields as any).description)
    formData.append(
      "description",
      capitalizeFirstLetter((fields as any).description),
    );

  if ((fields as any).category)
    formData.append(
      "category",
      capitalizeFirstLetterOfEachWord((fields as any).category),
    );

  formData.append("primaryImageIndex", String(primaryImageIndex));

  // ---- CREATE ----
  if (!isUpdate) {
    for (const f of files) formData.append("productImages", f);
  } else {
    // ---- PATCH ----
    if (productId) formData.append("productId", productId);
    for (const f of files) formData.append("newProductImages", f);

    if (imageUrlsToDelete.length > 0) {
      imageUrlsToDelete.forEach((url) =>
        formData.append("imageUrlsToDelete", url),
      );
    }
  }

  console.log("form data: ", formData);
  return formData;
}
