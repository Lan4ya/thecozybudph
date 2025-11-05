import { useCallback, useEffect, useState } from "react";
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
import { useProducts } from "@/hooks/useProducts";
import { ColorTagsInput } from "@/pages/admin/subpages/products/components/form/ColorVariantsInput";
import z from "zod";

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

type ProductFormValues = z.input<typeof productFormSchema>;

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
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; url: string }[]
  >([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);

  const { addProductMutation, updateProductMutation } = useProducts();

  const savingProductUpdate =
    addProductMutation.isPending || updateProductMutation.isPending;

  const fileFieldName = updatingProduct
    ? "new_product_images"
    : "product_images";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
    reset,
    clearErrors,
    setError,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: updatingProduct
      ? {
          mode: "update",
          ...getMappedUpdatingProductKV(updatingProduct),
        }
      : { mode: "create", ...getEmptyFormKV() },
  });

  const values = watch();

  // reset / reinit when modal opens
  useEffect(() => {
    if (!open) return;

    selectedFiles.forEach((n) => URL.revokeObjectURL(n.url));
    setSelectedFiles([]);
    setImagesToDelete([]);

    if (updatingProduct) {
      console.log("Setting primary image URL:", {
        primary_image_url: updatingProduct.primary_image_url,
        first_image_url: updatingProduct.image_urls?.[0],
        finalValue:
          updatingProduct.primary_image_url ??
          updatingProduct.image_urls?.[0] ??
          null,
      });

      reset({
        mode: "update",
        ...getMappedUpdatingProductKV(updatingProduct),
      });

      setPrimaryImageUrl(
        updatingProduct.primary_image_url ??
          updatingProduct.image_urls?.[0] ??
          null,
      );
    } else {
      // create product
      reset({ mode: "create", ...getEmptyFormKV() });
      setPrimaryImageUrl(null);
    }
  }, [open, updatingProduct, reset]);

  // Derive image previews
  useEffect(() => {
    if (!open) return;
    console.log(updatingProduct);

    const existing = updatingProduct?.image_urls ?? [];
    const existingFiltered = existing.filter(
      (u: string) => !imagesToDelete.includes(u),
    );
    const newUrls = selectedFiles.map((n) => n.url);
    setImagePreviews([...existingFiltered, ...newUrls]);
  }, [selectedFiles, imagesToDelete, updatingProduct]);

  const handleSelectFiles = useCallback(
    (newFiles: File[]) => {
      clearErrors(fileFieldName);

      setSelectedFiles((prev) => {
        const existingKeys = new Set(
          prev.map((n) => n.file.name + n.file.size + n.file.lastModified),
        );

        const uniqueFiles = newFiles.filter(
          (f) => !existingKeys.has(f.name + f.size + f.lastModified),
        );

        const created = uniqueFiles.map((f) => ({
          file: f,
          url: URL.createObjectURL(f),
        }));

        const updated = [...prev, ...created];

        const existingCount =
          updatingProduct?.image_urls?.filter(
            (u: string) => !imagesToDelete.includes(u),
          ).length ?? 0;

        if (existingCount + prev.length + newFiles.length > 2) {
          setError(fileFieldName, {
            type: "manual",
            message: "You can upload up to 2 images only",
          });
          return prev;
        }

        // Auto-set primary
        if (!primaryImageUrl && updated.length > 0) {
          const firstUrl =
            updatingProduct?.image_urls?.find(
              (u: string) => !imagesToDelete.includes(u),
            ) ?? updated[0].url;

          setPrimaryImageUrl(firstUrl);
          setValue("primary_image_url", firstUrl, { shouldValidate: true });
        }

        // Sync RHF
        setValue(
          fileFieldName,
          updated.map((n) => n.file),
          { shouldValidate: true },
        );

        return updated;
      });
    },
    [
      fileFieldName,
      primaryImageUrl,
      updatingProduct,
      setValue,
      clearErrors,
      setError,
    ],
  );

  const handleRemovePreview = useCallback(
    (url: string) => {
      const existingUrls = updatingProduct?.image_urls ?? [];

      if (existingUrls.includes(url)) {
        setImagesToDelete((prev) => {
          if (prev.includes(url)) return prev;
          const next = [...prev, url];

          if (primaryImageUrl === url) {
            setPrimaryImageUrl(null);
          }

          setValue("image_urls_to_delete", next, { shouldValidate: false });
          return next;
        });

        return;
      }

      setSelectedFiles((prev) => {
        const remaining = prev.filter((n) => {
          if (n.url === url) {
            URL.revokeObjectURL(n.url);
            return false;
          }
          return true;
        });

        setValue(
          fileFieldName,
          remaining.map((n) => n.file),
          { shouldValidate: true },
        );
        return remaining;
      });
    },
    [
      fileFieldName,
      updatingProduct,
      primaryImageUrl,
      setValue,
      setImagesToDelete,
    ],
  );

  const onSubmit = (data: any) => {
    if (!updatingProduct) {
      const files = selectedFiles.map((n) => n.file);
      const formData = buildProductFormData({
        fields: data,
        files,
        primaryImageUrl: data.primary_image_url,
        isUpdate: false,
      });

      console.log(formData);
      addProductMutation.mutate(formData);
      onSaved();

      return;
    }

    // Updating product

    if (imagePreviews.length === 0) {
      // put the err in this optionial field just to display the err
      setError("new_product_images", {
        type: "manual",
        message: "Product must retain at least one image",
      });
      return;
    }

    const files = selectedFiles.map((n) => n.file);
    const formData = buildProductFormData({
      fields: data,
      files,
      imagesToDelete,
      primaryImageUrl: data.primary_image_url,
      isUpdate: true,
    });

    console.log(formData);
    updateProductMutation.mutate(formData);
    onSaved();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      selectedFiles.forEach((n) => URL.revokeObjectURL(n.url));
    };
  }, []);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div>
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
                    className="w-full min-h-[100px] max-h-32 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Image Upload */}
                <div className="md: col-span-2">
                  <ImageUploadInput
                    onSelectFiles={handleSelectFiles}
                    previewImages={imagePreviews}
                    onRemovePreview={handleRemovePreview}
                    imagesToDelete={imagesToDelete}
                    setImagesToDelete={setImagesToDelete}
                    primaryImageUrl={primaryImageUrl}
                    setPrimaryImageUrl={(url) => {
                      setPrimaryImageUrl(url);
                      setValue("primary_image_url", url);
                    }}
                  />
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
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!isDirty || savingProductUpdate}
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

function getEmptyFormKV(): NewProduct {
  return {
    name: "",
    price: "" as unknown as number,
    description: "",
    color_variants: [],
    product_images: [],
  };
}

function getMappedUpdatingProductKV(
  updatingProduct: ProductPayloadFromDB,
): UpdateProduct {
  return {
    product_id: updatingProduct.id,
    name: updatingProduct.name,
    price: updatingProduct.price,
    description: updatingProduct.description ?? undefined,
    color_variants: updatingProduct.color_variants ?? [],
    new_product_images: [],
    image_urls_to_delete: [],
    primary_image_url:
      updatingProduct.primary_image_url ??
      updatingProduct.image_urls?.[0] ??
      null,
  };
}
