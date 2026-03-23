import { useCallback, useEffect, useMemo, useState } from "react";

// import { useToast } from "@/providers/ToastProvider";
import { motion } from "framer-motion";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ProductFormInput, productFormSchema } from "@TheCozyBud/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/ui/__shadcn__/card";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { X } from "lucide-react";
import {
  buildUpdateProductFormData,
  buildCreateProductFormData,
} from "./helpers/buildProductFormData";
import z from "zod";
import { formHasChanges } from "./helpers/formHasChanges";
import { useProductMutations } from "@/pages/profile/pages/admin-dashboard/pages/products/hooks/useProductsMutations";
import { useImageCompressor } from "@/pages/profile/pages/admin-dashboard/pages/products/hooks/useImageConverter";
import {
  getCreateFormDefaultValues,
  getUpdateFormDefaultValues,
} from "./helpers/defaultFormValues";
import ProductDetails from "./ProductDetails";
import { formatFileSize } from "@/lib/utils/format";
import { ProductOptions } from "./ProductOptions";
import ProductVariants from "./ProductVariants";
import { useProductsPageState } from "../../hooks/useProductsPageState";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

const MAX_IMAGES = 3;

export default function ProductForm() {
  const {
    isFormOpen,
    editingProduct: updatingProduct,
    setFormOpen,
  } = useProductsPageState();

  const [newSelectedFiles, setNewSelectedFiles] = useState<
    { file: File; url: string }[]
  >([]);
  // images to mark for deletion from existing DB URLs
  const [imageUrlsToDelete, setImageUrlsToDelete] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  const { compressImages } = useImageCompressor();

  const { createProductMutation, updateProductMutation } =
    useProductMutations();

  const fileFieldName = updatingProduct ? "newProductImages" : "productImages";

  const form = useForm<
    z.input<typeof productFormSchema>,
    any,
    z.output<typeof productFormSchema>
  >({
    resolver: zodResolver(productFormSchema),
    defaultValues: updatingProduct
      ? { ...getUpdateFormDefaultValues(updatingProduct) }
      : { ...getCreateFormDefaultValues() },
  });

  const hasChanges = formHasChanges(
    form.watch() as ProductFormInput,
    updatingProduct,
    {
      imagesToDelete: imageUrlsToDelete,
      newSelectedFilesCount: newSelectedFiles.length,
      primaryImageIndex,
    },
  );

  const formSteps = [
    () => (
      <ProductDetails
        displayImages={displayImages}
        handleSelectFiles={handleSelectFiles}
        handleRemoveImage={handleRemoveImage}
        primaryImageIndex={primaryImageIndex}
        setPrimaryImageIndex={setPrimaryImageIndex}
        MAX_IMAGES={MAX_IMAGES}
      />
    ),
    () => <ProductOptions />,
    () => <ProductVariants updatingProduct={updatingProduct} />,
  ];

  const [currentFormStep, setCurrentFormStep] = useState(0);

  const isLastFormStep = currentFormStep === formSteps.length - 1;

  const FormStep = formSteps[currentFormStep];

  const nextStep = async () => {
    if (isLastFormStep) return;

    if (!updatingProduct) {
      switch (currentFormStep) {
        case 0: {
          const valid = await form.trigger([
            "name",
            "description",
            "categoryName",
            "collectionName",
            "productImages",
            "primaryImageIndex",
            "basePrice",
          ]);
          if (!valid) {
            console.log("Step 1 error:", form.formState.errors);
            return;
          }

          if (displayImages.length === 0) {
            form.setError("newProductImages", {
              type: "manual",
              message: "Product must retain at least one image",
            });
            return;
          }
          break;
        }
        case 1: {
          const valid = await form.trigger(["options"]);
          if (!valid) {
            console.log("Step 2 error:", form.formState.errors.options);
            return;
          }
          break;
        }
        case 2: {
          const valid = await form.trigger(["variants"]);
          if (!valid) {
            console.log("Step 3 error:", form.formState.errors.variants);
            return;
          }
          break;
        }
        default:
          break;
      }
    }

    setCurrentFormStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentFormStep > 0) setCurrentFormStep((s) => s - 1);
  };

  // useEffect(() => {
  //   console.log("current step: ", currentFormStep);
  //   console.log({ isLastFormStep });
  // }, [currentFormStep]);

  // Derive image display: existing minus deletions plus selected blob urls
  const displayImages = useMemo(() => {
    const existing = updatingProduct?.imageUrls ?? [];
    const filteredExisting = existing.filter(
      (u: string) => !imageUrlsToDelete.includes(u),
    );
    const newUrls = newSelectedFiles.map((n) => n.url);
    return [...filteredExisting, ...newUrls];
  }, [updatingProduct, imageUrlsToDelete, newSelectedFiles]);

  // Reset on form isFormOpen
  useEffect(() => {
    if (!isFormOpen) return;

    newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url)); // cleanup previous blobs
    setNewSelectedFiles([]);
    setImageUrlsToDelete([]);
    setCurrentFormStep(0);

    form.reset(
      updatingProduct
        ? { ...getUpdateFormDefaultValues(updatingProduct) }
        : { ...getCreateFormDefaultValues() },
    );

    // Set initial primary index:
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
  }, [isFormOpen, updatingProduct, form.reset]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      newSelectedFiles.forEach((s) => URL.revokeObjectURL(s.url));
    };
  }, [newSelectedFiles]);

  const handleSelectFiles = useCallback(
    (files: File[]) => {
      form.clearErrors(fileFieldName);

      const existingCount = (updatingProduct?.imageUrls ?? []).filter(
        (u: string) => !imageUrlsToDelete.includes(u),
      ).length;
      const currentSelectedCount = newSelectedFiles.length;
      if (existingCount + currentSelectedCount + files.length > MAX_IMAGES) {
        form.setError(fileFieldName, {
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
        form.setValue(
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
      form.setError,
      form.setValue,
      updatingProduct,
      form.clearErrors,
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
          form.setValue("imageUrlsToDelete", next, { shouldValidate: false });
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
        form.setValue(
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
      form.setValue,
      updatingProduct,
    ],
  );

  const onSubmit = async (fieldData: ProductFormInput) => {
    console.log("submit trigger");
    // setSubmitting(true);
    setFormOpen(false); // close form immediately

    const files = newSelectedFiles.map((s) => s.file);
    console.log({ files });
    let compressedFiles: File[] = [];

    if (files.length) {
      const largeFiles = files.filter((f) => f.size > 850 * 1024);
      const smallFiles = files.filter((f) => f.size <= 850 * 1024);

      compressedFiles =
        largeFiles.length > 0 ? await compressImages(largeFiles) : [];

      console.log(largeFiles.map((f) => formatFileSize(f.size)));
      console.log(compressedFiles.map((f) => formatFileSize(f.size)));

      compressedFiles = [...compressedFiles, ...smallFiles];

      console.log({ compressedFiles });
    }

    if (fieldData.mode === "update" && updatingProduct) {
      const formData = buildUpdateProductFormData({
        ...fieldData,
        imageUrlsToDelete,
      });
      await updateProductMutation.mutateAsync({
        formData,
        productId: updatingProduct.id,
      });
    }

    if (fieldData.mode === "create") {
      const formData = buildCreateProductFormData({
        ...fieldData,
        productImages: compressedFiles,
        primaryImageIndex,
      });

      await createProductMutation.mutateAsync(formData);
    }
  };

  useLockBodyScroll(isFormOpen);

  if (!isFormOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="w-full max-w-2xl relative ">
        <button
          onClick={() => setFormOpen(false)}
          className="absolute top-3 right-3 p-1 rounded-md"
          aria-label="close"
        >
          <X />
        </button>

        <CardHeader className="custom-container">
          <CardTitle className="">
            <div className="flex items-center gap-4">
              {updatingProduct ? (
                <span>Update Product</span>
              ) : (
                <>
                  <span>Create Product</span>
                  <span className="text-muted-foreground text-sm">
                    {currentFormStep + 1}/3
                  </span>
                </>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0">
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (err) =>
                console.log("Form validation errors:", err),
              )}
            >
              <div className="max-h-[70dvh] overflow-y-auto custom-container overflow-x-visible">
                {/* 3 Main Form Step Components */}
                {FormStep()}
              </div>

              {/* Actions */}
              <div className="custom-container border-t border-black/10 pt-4 flex gap-3">
                {/* Cancel */}
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="mr-auto"
                >
                  Cancel
                </Button>

                {/* Prev */}
                <Button
                  variant="outline"
                  type="button"
                  disabled={currentFormStep === 0}
                  onClick={prevStep}
                >
                  Prev
                </Button>

                {/* Next */}
                {!isLastFormStep && (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!updatingProduct && !hasChanges}
                    onClick={nextStep}
                  >
                    Next
                  </Button>
                )}

                {/* Submit */}
                {isLastFormStep && (
                  <Button
                    type="submit"
                    disabled={!hasChanges || form.formState.isSubmitting}
                    variant="secondary"
                  >
                    {form.formState.isSubmitting && <Spinner />}
                    {updatingProduct ? "Update" : "Create"}
                  </Button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </motion.div>
  );
}
