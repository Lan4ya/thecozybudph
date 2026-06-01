import { useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  src: string;
  alt?: string;
  loading?: "eager" | "lazy";
  roundedSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

export const ProductImage = ({
  src,
  alt = "product-image",
  loading = "lazy",
  roundedSize,
  className,
}: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fallBackImg = "/no-image-light.webp";
  const borderRadius = `rounded-${roundedSize ?? ""}`;

  return (
    <div
      className={cn(
        "h-full w-full relative overflow-hidden",
        borderRadius,
        className,
      )}
    >
      {!loaded && (
        <Skeleton
          className={cn("absolute inset-0 rounded-none", borderRadius)}
        />
      )}
      <img
        src={imgError ? fallBackImg : src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
        draggable={false}
        className={cn(
          loaded ? "opacity-100" : "opacity-0",
          "pointer-events-none select-none h-full w-full object-cover transition-opacity duration-300",
        )}
      />
    </div>
  );
};
