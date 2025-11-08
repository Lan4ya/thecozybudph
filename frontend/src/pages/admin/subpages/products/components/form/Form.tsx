import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type NewProduct,
  type UpdateProduct,
  createProductSchema,
  updateProductSchema,
} from "@TheCozyBud/schema";
import type { ProductPayloadFromDB } from "@/lib/supabase/products";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/ui/__shadcn__/card";
import { Input } from "@/lib/ui/__shadcn__/input";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { X } from "lucide-react";
import ImageUploadInput from "./ImageUploadInput";
import { buildProductFormData } from "@/pages/admin/utils/buildProductFormData";
import { useProductMutations } from "@/pages/admin/hooks/useProductsMutations";
import { ColorTagsInput } from "@/pages/admin/subpages/products/components/form/ColorVariantsInput";
import z from "zod";
import { formHasChanges } from "@/pages/admin/utils/formHasChanges";

const createProductFormSchema = createProductSchema.extend({
  mode: z.literal("create"),
});

const updateProductFormSchema = updateProductSchema.extend({
  mode: z.literal("update"),
});

const productFormSchema = z.discriminatedUnion("mode", [
  createProductFormSchema,
  updateProductFormSchema,
]);

export type ProductFormValues = z.input<typeof productFormSchema>;

type Props = {
  open: boolean;
  updatingProduct: ProductPayloadFromDB | null;
  onSaved: () => void;
  onClose: () => void;
};

export default function ProductForm({
  open,
  onClose,
  updatingProduct,
  onSaved,
}: Props) {
  const [newSelectedFiles, setNewSelectedFiles] = useState<
    { file: File; url: string }[]
  >([]);
  // images to mark for deletion from existing DB URLs
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(-1);

  const { addProductMutation, updateProductMutation } = useProductMutations();
  const savingProductUpdate =
    addProductMutation.isPending || updateProductMutation.isPending;

  const MAX_IMAGES = 2;
  const fileFieldName = updatingProduct
    ? "new_product_images"
    : "product_images";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    clearErrors,
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: updatingProduct
      ? { mode: "update", ...getMappedUpdatingProductKV(updatingProduct) }
      : { mode: "create", ...getEmptyFormKV() },
  });

  const values = watch();

  const hasChanges = formHasChanges(values, updatingProduct, {
    imagesToDelete,
    newSelectedFilesCount: newSelectedFiles.length,
  });

  // Derive display images: existing (minus deletions) first, then selected blob urls
  const displayImages = useMemo(() => {
    const existing = updatingProduct?.image_urls ?? [];
    const filteredExisting = existing.filter(
      (u) => !imagesToDelete.includes(u),
    );
    const newUrls = newSelectedFiles.map((n) => n.url);
    return [...filteredExisting, ...newUrls];
  }, [updatingProduct, imagesToDelete, newSelectedFiles]);

  // Reset component state & form when modal opens
  useEffect(() => {
    if (!open) return;

    newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url)); // cleanup previous blobs
    setNewSelectedFiles([]);
    setImagesToDelete([]);

    reset(
      updatingProduct
        ? { mode: "update", ...getMappedUpdatingProductKV(updatingProduct) }
        : { mode: "create", ...getEmptyFormKV() },
    );

    // set initial primary index:
    if (updatingProduct) {
      const existing = updatingProduct.image_urls ?? [];
      const idx = existing.findIndex(
        (u) => u === updatingProduct.primary_image_url,
      );
      const initial = idx >= 0 ? idx : existing.length > 0 ? 0 : -1;
      setPrimaryImageIndex(initial);
    } else {
      setPrimaryImageIndex(-1);
    }
  }, [open, updatingProduct, reset]);

  // CLEANUP on unmount
  useEffect(() => {
    return () => {
      newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, [newSelectedFiles]);

  // --- Handlers ---

  // helper: ensure primary index is valid given new display length
  const normalizePrimaryIndex = useCallback((idx: number, length: number) => {
    if (length === 0) return -1;
    if (idx < 0) return 0;
    if (idx >= length) return length - 1;
    return idx;
  }, []);

  const handleSelectFiles = useCallback(
    (files: File[]) => {
      clearErrors(fileFieldName);

      const existingCount = (updatingProduct?.image_urls ?? []).filter(
        (u) => !imagesToDelete.includes(u),
      ).length;
      const currentSelectedCount = newSelectedFiles.length;
      if (existingCount + currentSelectedCount + files.length > MAX_IMAGES) {
        setError(fileFieldName, {
          type: "manual",
          message: `You can upload up to ${MAX_IMAGES} images only`,
        });
        return;
      }

      // dedupe by name+size+lastModified for newly selected files
      setNewSelectedFiles((prev) => {
        const existingKeys = new Set(
          prev.map(
            (p) => `${p.file.name}-${p.file.size}-${p.file.lastModified}`,
          ),
        );

        const unique = files.filter(
          (f) => !existingKeys.has(`${f.name}-${f.size}-${f.lastModified}`),
        );

        const created = unique.map((f) => ({
          file: f,
          url: URL.createObjectURL(f),
        }));

        const next = [...prev, ...created];

        // sync RHF file field so validation can see selected files
        setValue(
          fileFieldName,
          next.map((n) => n.file),
          { shouldValidate: true },
        );

        // if primary not set yet, set it to first newly added image
        if (primaryImageIndex === -1 && created.length > 0) {
          const existingLen = (updatingProduct?.image_urls ?? []).filter(
            (u) => !imagesToDelete.includes(u),
          ).length;
          const newPrimary = existingLen; // first new file index
          setPrimaryImageIndex(newPrimary);
        }

        return next;
      });
    },
    [
      fileFieldName,
      imagesToDelete,
      MAX_IMAGES,
      primaryImageIndex,
      newSelectedFiles.length,
      setError,
      setValue,
      updatingProduct,
      clearErrors,
    ],
  );

  const handleRemoveImage = useCallback(
    (url: string, idx: number) => {
      const existing = updatingProduct?.image_urls ?? [];
      const filteredExisting = existing.filter(
        (u) => !imagesToDelete.includes(u),
      );
      const existingCount = filteredExisting.length; // number of existing images currently shown

      // if it's an existing URL (idx < existingCount), mark it for deletion
      if (idx < existingCount) {
        setImagesToDelete((prev) => {
          if (prev.includes(url)) return prev;
          const next = [...prev, url];

          // after deletion, recompute display length
          const newDisplayLength =
            existing.length - next.length + newSelectedFiles.length;
          // if removed item was primary, fallback to either 0 (first remaining existing) or first selected
          if (primaryImageIndex === idx) {
            const newPrimary = newDisplayLength > 0 ? 0 : -1;
            setPrimaryImageIndex(newPrimary);
          } else if (primaryImageIndex > idx) {
            // shift primary index down because earlier existing was removed
            setPrimaryImageIndex((p) => p - 1);
          }

          // sync form field for server
          setValue("image_urls_to_delete", next, { shouldValidate: false });
          return next;
        });

        return;
      }

      // otherwise it is a newly selected file (idx >= existingCount)
      setNewSelectedFiles((prev) => {
        const remaining = prev.filter((p) => {
          if (p.url === url) {
            URL.revokeObjectURL(p.url);
            return false;
          }
          return true;
        });

        // sync RHF file field
        setValue(
          fileFieldName,
          remaining.map((n) => n.file),
          { shouldValidate: true },
        );

        // calculate new display length and adjust primary index if needed
        const newDisplayLength =
          existing.filter((u) => !imagesToDelete.includes(u)).length +
          remaining.length;
        const removedGlobalIndex = idx;

        setPrimaryImageIndex((prevPrimary) => {
          if (prevPrimary === removedGlobalIndex) {
            // if primary removed, fallback
            return newDisplayLength > 0 ? 0 : -1;
          }

          if (prevPrimary > removedGlobalIndex) {
            // shift down if removal was before primary
            return prevPrimary - 1;
          }

          return prevPrimary;
        });

        return remaining;
      });
    },
    [
      fileFieldName,
      imagesToDelete,
      primaryImageIndex,
      newSelectedFiles,
      setValue,
      updatingProduct,
    ],
  );

  const onSubmit = (data: ProductFormValues) => {
    if (displayImages.length === 0) {
      setError("new_product_images", {
        type: "manual",
        message: "Product must retain at least one image",
      });
      return;
    }

    const files = newSelectedFiles.map((s) => s.file);

    const fd = buildProductFormData({
      fields: data,
      files,
      imagesToDelete,
      primary_image_index: normalizePrimaryIndex(
        primaryImageIndex,
        displayImages.length,
      ),
      isUpdate: data.mode === "update",
      productId: data.mode === "update" ? updatingProduct?.id : undefined,
    });

    data.mode === "create"
      ? addProductMutation.mutate(fd)
      : updateProductMutation.mutate(fd);

    onSaved();
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-md"
          aria-label="close"
        >
          <X />
        </button>

        <CardHeader>
          <CardTitle>
            {updatingProduct ? "Edit Product" : "Create Product"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit, (err) =>
              console.log("Validation errors:", err),
            )}
          >
            <div className="max-h-[70dvh] overflow-x-hidden overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 ">
                {/* Name */}
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Name
                  </label>
                  <Input {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Price (PHP)
                  </label>
                  <Input
                    min={0}
                    inputMode="decimal"
                    type="number"
                    step="any"
                    {...register("price", { valueAsNumber: true })}
                    onPaste={(e) => {
                      const text = e.clipboardData.getData("text");
                      if (!/^\d*\.?\d*$/.test(text)) e.preventDefault();
                    }}
                    onKeyDown={(e) => {
                      if (
                        !/[0-9.]$/.test(e.key) &&
                        ![
                          "Backspace",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Delete",
                          "Enter",
                        ].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                {/* Collection */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Collection Name (optional)
                  </label>
                  <Input {...register("collection_name")} />
                </div>

                {/* Color Variants */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Color Variants (optional)
                  </label>
                  <ColorTagsInput
                    value={watch("color_variants") ?? []}
                    onChange={(colors) => setValue("color_variants", colors)}
                  />
                  {errors.color_variants && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.color_variants.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Description (optional)
                  </label>
                  <textarea
                    {...register("description")}
                    className="w-full min-h-[100px] max-h-32 rounded-md border border-input bg-background! px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <ImageUploadInput
                    images={displayImages}
                    onSelectFiles={handleSelectFiles}
                    onRemoveImage={handleRemoveImage}
                    primaryImageIndex={primaryImageIndex}
                    setPrimaryImageIndex={setPrimaryImageIndex}
                    maxImages={MAX_IMAGES}
                  />

                  {/* show validation messages */}
                  {values.mode === "create" &&
                    (errors as FieldErrors<NewProduct>)?.product_images
                      ?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          (errors as FieldErrors<NewProduct>).product_images
                            ?.message
                        }
                      </p>
                    )}
                  {values.mode === "update" &&
                    (errors as FieldErrors<UpdateProduct>)?.new_product_images
                      ?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          (errors as FieldErrors<UpdateProduct>)
                            .new_product_images?.message
                        }
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={savingProductUpdate || !hasChanges}
                className="bg-secondary hover:bg-secondary/90"
              >
                {savingProductUpdate && <Spinner className="mr-2" />}
                {updatingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper for default values

function getEmptyFormKV(): NewProduct {
  return {
    name: "",
    price: "" as unknown as number,
    description: "",
    color_variants: [],
    product_images: [],
    primary_image_index: -1,
  };
}

function getMappedUpdatingProductKV(
  updatingProduct: ProductPayloadFromDB,
): UpdateProduct {
  return {
    product_id: updatingProduct.id,
    name: updatingProduct.name,
    price: updatingProduct.price,
    collection_name: updatingProduct.products_collection?.name ?? undefined,
    description: updatingProduct.description ?? undefined,
    color_variants: updatingProduct.color_variants ?? [],
    new_product_images: [],
    image_urls_to_delete: [],
    primary_image_index: -1,
  };
}
