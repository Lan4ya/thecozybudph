import { Input } from "@/lib/ui/__shadcn__/input";
import type {
  CreateProductFormInput,
  ProductFormInput,
  ProductFormOutput,
  UpdateProductFormInput,
} from "@cozybud/schemas";
import { useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import ImageUploadInput from "./ImageUploadInput";
import { cn } from "@/lib/utils/cn";

interface ProductDetailsProps {
  displayImages: string[];

  handleSelectFiles: (files: File[]) => void;
  handleRemoveImage: (url: string, idx: number) => void;

  primaryImageIndex: number;
  setPrimaryImageIndex: (index: number) => void;

  MAX_IMAGES: number;
}

export const ProductDetails = ({
  displayImages,
  handleSelectFiles,
  handleRemoveImage,
  primaryImageIndex,
  setPrimaryImageIndex,
  MAX_IMAGES,
}: ProductDetailsProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ProductFormInput, unknown, ProductFormOutput>();

  const [mode, description] = useWatch({
    name: ["mode", "description"],
    control,
  });

  const isCreateMode = mode === "create";

  const createImageError =
    (errors as FieldErrors<CreateProductFormInput>)?.productImages?.message ??
    undefined;

  const updateImageError =
    (errors as FieldErrors<UpdateProductFormInput>)?.newProductImages
      ?.message ?? undefined;
  const imageErrorMessage = isCreateMode ? createImageError : updateImageError;

  const basePriceError =
    (errors as FieldErrors<CreateProductFormInput>)?.basePrice?.message ??
    undefined;

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 pb-4">
      {/* Name */}
      <div className={cn(!isCreateMode && "md:col-span-2")}>
        <label className="block text-sm mb-1 text-muted-foreground">Name</label>
        <Input {...register("name")} />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Base Price */}
      {isCreateMode && (
        <div>
          <label className="block text-sm mb-1 text-muted-foreground">
            Base Price (PHP)
          </label>
          <Input
            min={0}
            inputMode="numeric"
            type="text"
            {...register("basePrice")}
            onPaste={(e) => {
              const text = e.clipboardData.getData("text");
              if (!/^\d*$/.test(text)) e.preventDefault();
            }}
            // onKeyDown={(e) => {
            //   if (
            //     !/^\d*$/.test(e.key) &&
            //     ![
            //       "Backspace",
            //       "Tab",
            //       "ArrowLeft",
            //       "ArrowRight",
            //       "Delete",
            //       "Enter",
            //     ].includes(e.key)
            //   ) {
            //     e.preventDefault();
            //   }
            // }}
          />
          {basePriceError && (
            <p className="text-xs text-red-500 mt-1">{basePriceError}</p>
          )}
        </div>
      )}

      {/* Category */}
      <div className="md:col-span-2">
        <label className="block text-sm mb-1 text-muted-foreground">
          Category
        </label>
        <Input
          placeholder="bouquet, vase, mug, etc."
          {...register("categoryName")}
        />
        {errors.categoryName && (
          <p className="text-xs text-red-500 mt-1">
            {errors.categoryName.message}
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
            className={`ml-auto text-xs ${(description?.length ?? 0) > 600 ? "text-red-500" : "text-muted-foreground"}`}
          >
            {description?.length ?? 0}/600
          </span>
        </div>
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
        {imageErrorMessage && (
          <p className="mt-1 text-xs text-red-500">{imageErrorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
