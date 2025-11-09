import { useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { cn } from "@/lib/utils/cn";

type ProductImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

export const ProductImage = ({
  src,
  alt = "product-image",
  className,
}: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fallBackImg = "/no-image-light.png";

  return (
    <div className={cn("relative overflow-hidden block rounded-md", className)}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-md" />}
      <img
        src={imgError ? fallBackImg : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setImgError(true)}
        className={cn(
          loaded ? "opacity-100" : "opacity-0",
          "rounded h-full w-full object-cover transition-opacity duration-300",
        )}
      />
    </div>
  );
};

// export const ProductImage = React.memo(
//   Base,
//   (prev, next) => prev.src === next.src && prev.alt === next.alt,
// );
