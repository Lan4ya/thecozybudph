import { memo } from "react";
import { Info, UploadCloud } from "lucide-react";
import { ProductImage } from "@/components/ProductImage";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";

type Props = {
  images: string[]; // display images: existing (filtered) + newly selected blob urls
  onSelectFiles: (files: File[]) => void;
  onRemoveImage: (url: string, idx: number) => void;
  primaryImageIndex: number;
  setPrimaryImageIndex: (idx: number) => void;
  maxImages?: number;
};

function ImageUploadInput({
  images,
  onSelectFiles,
  onRemoveImage,
  primaryImageIndex,
  setPrimaryImageIndex,
  maxImages = 2,
}: Props) {
  const { addToast } = useToast();

  return (
    <div className="flex flex-col gap-3 md:flex-row md:gap-20">
      <div className="flex items-center gap-3">
        <label
          onClick={(e) => {
            if (images.length >= maxImages) {
              e.preventDefault();
              addToast(
                `You can upload up to ${maxImages} images only`,
                "error",
              );
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
              if (files.length === 0) return;
              onSelectFiles(files);
            }}
          />
        </label>

        <UploadHint />
      </div>

      <div className="flex gap-3 overflow-x-auto">
        {images.map((src, idx) => {
          const isPrimary = idx === primaryImageIndex;

          return (
            <div
              key={`${src}-${idx}`}
              className="relative group w-28 h-28 rounded-md overflow-hidden border"
            >
              <ProductImage
                src={src}
                alt={`preview-${idx}`}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                onClick={() => onRemoveImage(src, idx)}
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
                  setPrimaryImageIndex(idx);
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
          `You can upload up to ${2} images per product; keep each under 20 MB.`}
      </div>
    </div>
  );
}

export default memo(ImageUploadInput);
