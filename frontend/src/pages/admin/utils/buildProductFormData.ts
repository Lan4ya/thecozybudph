import type { ProductBase } from "@TheCozyBud/schema";

type BuildOpts = {
  fields: ProductBase;
  files?: File[];
  imagesToDelete?: string[];
  primaryImageUrl?: string | null;
  isUpdate?: boolean;
  productId?: string;
};

// type x = isUpdate ? UpdateProduct : NewProduct;

export function buildProductFormData(opts: BuildOpts) {
  const {
    fields,
    files = [],
    imagesToDelete = [],
    primaryImageUrl,
    isUpdate,
    productId,
  } = opts;

  const formData = new FormData();

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

  if (primaryImageUrl) formData.append("primary_image_url", primaryImageUrl);

  if (!isUpdate) {
    // add-product expects "product_images"
    for (const f of files) formData.append("product_images", f);
  } else {
    if (productId) formData.append("product_id", productId);
    for (const f of files) formData.append("new_product_images", f);
    if (imagesToDelete && imagesToDelete.length) {
      formData.append("image_urls_to_delete", JSON.stringify(imagesToDelete));
    }
  }

  return formData;
}
