import type { NewProduct, UpdateProduct } from "@TheCozyBud/schema";

type BuildOpts = {
  fields: NewProduct | UpdateProduct;
  files?: File[];
  imagesToDelete?: string[];
  isUpdate?: boolean;
  productId?: string;
  primary_image_index: number;
};

export function buildProductFormData(opts: BuildOpts) {
  const {
    fields,
    files = [],
    imagesToDelete = [],
    isUpdate,
    productId,
    primary_image_index,
  } = opts;

  const formData = new FormData();

  // ---- BASIC FIELDS ----
  if (fields.name !== undefined) formData.append("name", String(fields.name));

  if (fields.price !== undefined)
    formData.append("price", String(fields.price));

  if ((fields as any).collection_name)
    formData.append("collection_name", (fields as any).collection_name);

  if ((fields as any).color_variants)
    formData.append(
      "color_variants",
      JSON.stringify((fields as any).color_variants),
    );

  if ((fields as any).description)
    formData.append("description", (fields as any).description);

  formData.append("primary_image_index", String(primary_image_index));

  // ---- CREATE FLOW ----
  if (!isUpdate) {
    for (const f of files) formData.append("product_images", f);
  }
  // ---- UPDATE FLOW ----
  else {
    if (productId) formData.append("product_id", productId);
    for (const f of files) formData.append("new_product_images", f);

    if (imagesToDelete.length > 0) {
      formData.append("image_urls_to_delete", JSON.stringify(imagesToDelete));
    }
  }

  return formData;
}
