import type {
  CreateProductFormOutput,
  UpdateProductFormOutput,
} from "@cozybud/schemas";

export function buildCreateProductFormData(fields: CreateProductFormOutput) {
  const fd = new FormData();

  fd.append("name", fields.name);

  fd.append("categoryName", fields.categoryName);

  fields.productImages.forEach((p) => fd.append("productImages", p));

  fd.append("options", JSON.stringify(fields.options));

  fd.append("variants", JSON.stringify(fields.variants));

  fd.append("primaryImageIndex", String(fields.primaryImageIndex));

  appendIfDefined(fd, "description", fields.description && fields.description);

  appendIfDefined(
    fd,
    "collectionName",
    fields.collectionName && fields.collectionName,
  );

  // for (const pair of fd.entries()) {
  //   console.log(pair[0], pair[1]);
  // }

  console.log({ fd });
  return fd;
}

export function buildUpdateProductFormData(fields: UpdateProductFormOutput) {
  const fd = new FormData();

  appendIfDefined(fd, "name", fields.name);

  fd.append("options", JSON.stringify(fields.options));

  fd.append("variants", JSON.stringify(fields.variants));

  appendIfDefined(fd, "description", fields.description && fields.description);

  appendIfDefined(
    fd,
    "categoryName",
    fields.categoryName && fields.categoryName,
  );

  appendIfDefined(
    fd,
    "collectionName",
    fields.collectionName && fields.collectionName,
  );

  appendIfDefined(fd, "primaryImageIndex", fields.primaryImageIndex);

  fields.imageUrlsToDelete?.forEach((url) =>
    fd.append("imageUrlsToDelete", url),
  );

  fields.newProductImages?.forEach((file) =>
    fd.append("newProductImages", file),
  );

  return fd;
}

function appendIfDefined<T>(fd: FormData, key: string, value: T | undefined) {
  if (value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((v) => fd.append(key, String(v)));
    return;
  }

  fd.append(key, value instanceof Blob ? value : String(value));
}
