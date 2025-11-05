import { Info, UploadCloud } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import { memo } from "react";

type Props = {
  previewImages: string[]; // derived: existing (minus deletions) + new file urls
  onSelectFiles: (files: File[]) => void;
  onRemovePreview: (url: string) => void;
  imagesToDelete: string[];
  setImagesToDelete: (urls: string[]) => void;
  primaryImageUrl: string | null;
  setPrimaryImageUrl: (url: string | null) => void;
};

function ImageUploadInput({
  previewImages,
  onSelectFiles,
  onRemovePreview,
  primaryImageUrl,
  setPrimaryImageUrl,
}: Props) {
  const { addToast } = useToast();

  return (
    <div className="flex gap-20">
      <div className="flex items-center gap-3">
        <label
          onClick={(e) => {
            if (previewImages.length >= 2) {
              e.preventDefault();

              addToast("You can upload up to 2 images only", "error");
            }
          }}
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-md"
        >
          <UploadCloud className="w-4 h-4" />
          <span className="text-sm">Choose images</span>

          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              onSelectFiles(files);
            }}
          />
        </label>

        <UploadHint />
      </div>
      <div className="flex gap-3 overflow-x-auto">
        {previewImages.map((u, idx) => {
          const isPrimary = primaryImageUrl === u;

          return (
            <div
              key={u + idx}
              className="relative group w-28 h-28 rounded-md overflow-hidden border"
            >
              <ProductImage
                src={u}
                alt={`preview-${idx}`}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => onRemovePreview(u)}
                className={cn(
                  "remove-overlay absolute inset-0 bg-black/45 opacity-0 transition flex items-center justify-center text-white text-sm",
                  "hover:bg-black/60",
                  "group-hover:opacity-100",
                  "[.primary-btn:hover_~_&]:opacity-0",
                )}
              >
                Remove
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // if (previewImages.length === 1) return;
                  setPrimaryImageUrl(isPrimary ? null : u);
                }}
                className={cn(
                  "primary-btn absolute bottom-1 right-1 text-xs px-2 py-1 rounded transition z-100",
                  isPrimary
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-200 hover:bg-gray-600",
                )}
              >
                {isPrimary ? "Primary" : "Set Primary"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function UploadHint({
  message,
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn("relative group inline-block", className)}>
      <Info
        className="size-6 text-blue-400 cursor-pointer transition-colors group-hover:text-blue-400/90"
        strokeWidth={2}
      />

      <div
        className={cn(
          "absolute bottom-full left-0 ml-1 mb-2",
          "bg-popover text-popover-foreground text-xs rounded-md shadow-md px-3 py-2",
          "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0",
          "transition-all duration-200 z-50 pointer-events-none",
          "max-w-[220px] w-max",
          "before:content-[''] before:absolute before:-bottom-1.5 before:left-2",
          "before:border-4 before:border-transparent before:border-t-popover",
        )}
      >
        {message ??
          `You can only upload up to 2 images per product, each image under 20 MB. These limits exist to conserve cloud storage and maintain website performance.`}
      </div>
    </div>
  );
}

export default memo(ImageUploadInput);
