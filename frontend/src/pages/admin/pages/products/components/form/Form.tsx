import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type CreateProductInput,
  type ProductDataWithJoins,
  type UpdateProductInput,
  createProductSchema,
  updateProductSchema,
} from "@TheCozyBud/schema";

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
import ImageUploadInput from "./ImageUpload";
import { buildProductFormData } from "@/pages/admin/utils/buildProductFormData";
import { ColorTagsInput } from "./ColorVariants";
import z from "zod";
import { formHasChanges } from "@/pages/admin/utils/formHasChanges";
import { useProductMutations } from "@/pages/admin/hooks/useProductsMutations";
import { useImageCompressor } from "@/pages/admin/hooks/useImageConverter";
import { formatFileSize } from "@/lib/utils/format";
import isDev from "@/lib/utils/isDev";

const createProductFormSchema = createProductSchema.extend({
  mode: z.literal("create"),
});

const updateProductFormSchema = updateProductSchema
  .omit({
    productId: true,
  })
  .extend({
    mode: z.literal("update"),
  });

const productFormSchema = z.discriminatedUnion("mode", [
  createProductFormSchema,
  updateProductFormSchema,
]);

export type ProductFormValues = z.infer<typeof productFormSchema>;

type Props = {
  open: boolean;
  updatingProduct: ProductDataWithJoins | null;
  onToggle: (t: boolean) => void;
};

export default function ProductForm({
  open,
  updatingProduct,
  onToggle,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [newSelectedFiles, setNewSelectedFiles] = useState<
    { file: File; url: string }[]
  >([]);
  // images to mark for deletion from existing DB URLs
  const [imageUrlsToDelete, setImageUrlsToDelete] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  const { compressImages } = useImageCompressor();

  const { addProductMutation, updateProductMutation } = useProductMutations();

  const MAX_IMAGES = 3;
  const fileFieldName = updatingProduct ? "newProductImages" : "productImages";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: updatingProduct
      ? { mode: "update", ...getMappedUpdatingProductKV(updatingProduct) }
      : { mode: "create", ...getEmptyFormKV() },
  });

  const formValues = watch();

  const hasChanges = formHasChanges(formValues, updatingProduct, {
    imagesToDelete: imageUrlsToDelete,
    newSelectedFilesCount: newSelectedFiles.length,
    primaryImageIndex,
  });

  // Derive display images: existing (minus deletions) first, then selected blob urls
  const displayImages = useMemo(() => {
    const existing = updatingProduct?.imageUrls ?? [];
    const filteredExisting = existing.filter(
      (u: string) => !imageUrlsToDelete.includes(u),
    );
    const newUrls = newSelectedFiles.map((n) => n.url);
    return [...filteredExisting, ...newUrls];
  }, [updatingProduct, imageUrlsToDelete, newSelectedFiles]);

  // Reset component state & form when modal opens
  useEffect(() => {
    if (!open) return;

    newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url)); // cleanup previous blobs
    setNewSelectedFiles([]);
    setImageUrlsToDelete([]);

    reset(
      updatingProduct
        ? { mode: "update", ...getMappedUpdatingProductKV(updatingProduct) }
        : { mode: "create", ...getEmptyFormKV() },
    );

    // set initial primary index:
    if (updatingProduct) {
      const existing = updatingProduct.imageUrls ?? [];
      const idx = existing.findIndex(
        (u: string) => u === updatingProduct.primaryImageUrl,
      );
      const initial = idx >= 0 ? idx : 0;
      setPrimaryImageIndex(initial);
    } else {
      setPrimaryImageIndex(0);
    }
  }, [open, updatingProduct, reset]);

  // CLEANUP on unmount
  useEffect(() => {
    return () => {
      newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, [newSelectedFiles]);

  const handleSelectFiles = useCallback(
    (files: File[]) => {
      clearErrors(fileFieldName);

      const existingCount = (updatingProduct?.imageUrls ?? []).filter(
        (u: string) => !imageUrlsToDelete.includes(u),
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
          const existingLen = (updatingProduct?.imageUrls ?? []).filter(
            (u: string) => !imageUrlsToDelete.includes(u),
          ).length;
          const newPrimary = existingLen; // first new file index
          setPrimaryImageIndex(newPrimary);
        }

        return next;
      });
    },
    [
      fileFieldName,
      imageUrlsToDelete,
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
      const existing = updatingProduct?.imageUrls ?? [];
      const filteredExisting = existing.filter(
        (u: string) => !imageUrlsToDelete.includes(u),
      );
      const existingCount = filteredExisting.length; // number of existing images currently shown

      // if it's an existing URL (idx < existingCount), mark it for deletion
      if (idx < existingCount) {
        setImageUrlsToDelete((prev) => {
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
            setPrimaryImageIndex((p) => (p > 0 ? p - 1 : 0));
          }

          // sync form field for server
          setValue("imageUrlsToDelete", next, { shouldValidate: false });
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
          existing.filter((u: string) => !imageUrlsToDelete.includes(u))
            .length + remaining.length;
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
      imageUrlsToDelete,
      primaryImageIndex,
      newSelectedFiles,
      setValue,
      updatingProduct,
    ],
  );

  const onSubmit = async (fieldData: ProductFormValues) => {
    setSubmitting(true);

    if (displayImages.length === 0) {
      setError("newProductImages", {
        type: "manual",
        message: "Product must retain at least one image",
      });
      return;
    }

    onToggle(false); // close form early

    const files = newSelectedFiles.map((s) => s.file);
    let compressedFiles: File[] = [];

    if (files.length) {
      const compressableFiles = files.filter((f) => f.size > 850 * 1024);
      const nonCompressableFiles = files.filter((f) => f.size <= 850 * 1024);

      compressedFiles =
        compressableFiles.length > 0
          ? await compressImages(compressableFiles)
          : [];

      console.log(compressableFiles.map((f) => formatFileSize(f.size)));
      console.log(compressedFiles.map((f) => formatFileSize(f.size)));

      compressedFiles = [...compressedFiles, ...nonCompressableFiles];
    }
    try {
      const fd = buildProductFormData({
        fields: fieldData,
        files: compressedFiles,
        isUpdate: fieldData.mode === "update",
        imageUrlsToDelete,
        primaryImageIndex,
        productId:
          fieldData.mode === "update" ? updatingProduct?.id : undefined,
      });

      fieldData.mode === "create"
        ? addProductMutation.mutateAsync(fd)
        : updateProductMutation.mutateAsync(fd);
    } finally {
      setSubmitting(false);
    }
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
          onClick={() => onToggle(false)}
          className="absolute top-3 right-3 p-1 rounded-md"
          aria-label="close"
        >
          <X />
        </button>

        <CardHeader>
          <CardTitle className="">
            {updatingProduct ? "Edit Product" : "Create Product"}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0!">
          <form
            onSubmit={handleSubmit(
              onSubmit,
              (err) => isDev && console.log("Form validation errors:", err),
            )}
          >
            <div className="max-h-[70dvh] px-6 overflow-x-visible overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 ">
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
                    {...register("price")}
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

                {/* Category */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Category
                  </label>
                  <Input
                    placeholder="bouquet, vase, mugs, etc."
                    {...register("category")}
                  />
                  {errors.category && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Collection */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Collection Name (optional)
                  </label>
                  <Input {...register("collectionName")} />
                  {errors.collectionName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.collectionName.message}
                    </p>
                  )}
                </div>

                {/* Color Variants */}
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Color Variants (optional)
                  </label>
                  <ColorTagsInput
                    colorVals={watch("colorVariants") ?? []}
                    onChange={(colors) => setValue("colorVariants", colors)}
                  />
                  {errors.colorVariants && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.colorVariants.message}
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
                    className="w-full min-h-[100px] max-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                  />

                  <div className="flex-between">
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.description.message}
                      </p>
                    )}

                    <span
                      className={`ml-auto text-xs ${
                        formValues.description?.length > 600
                          ? "text-red-500"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formValues.description?.length ?? 0}/600
                    </span>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="relative md:col-span-2">
                  <ImageUploadInput
                    images={displayImages}
                    onSelectFiles={handleSelectFiles}
                    onRemoveImage={handleRemoveImage}
                    primaryImageIndex={primaryImageIndex}
                    setPrimaryImageIndex={setPrimaryImageIndex}
                    maxImages={MAX_IMAGES}
                  />
                  {formValues.mode === "create" &&
                    (errors as FieldErrors<CreateProductInput>)?.productImages
                      ?.message && (
                      <p className="absolute -bottom-1 text-xs text-red-500 mt-1">
                        {
                          (errors as FieldErrors<CreateProductInput>)
                            .productImages?.message
                        }
                      </p>
                    )}
                  {formValues.mode === "update" &&
                    (errors as FieldErrors<UpdateProductInput>)
                      ?.newProductImages?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          (errors as FieldErrors<UpdateProductInput>)
                            .newProductImages?.message
                        }
                      </p>
                    )}
                </div>
              </div>
              {/* Actions */}
              <div className="mt-5 flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => onToggle(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={!hasChanges || submitting}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  {submitting && <Spinner className="mr-2" />}
                  {updatingProduct ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper for default values

function getEmptyFormKV(): CreateProductInput {
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

function getMappedUpdatingProductKV(
  updatingProduct: ProductDataWithJoins,
): Omit<UpdateProductInput, "productId"> {
  return {
    name: updatingProduct.name,
    price: updatingProduct.price,
    collectionName: updatingProduct.productCollection?.name ?? "",
    description: updatingProduct.description ?? "",
    category: updatingProduct.productCategory?.name ?? "",
    colorVariants: updatingProduct.colorVariants ?? [],
    newProductImages: [],
    imageUrlsToDelete: [],
    primaryImageIndex: updatingProduct.imageUrls.indexOf(
      updatingProduct.primaryImageUrl,
    ),
  };
}
