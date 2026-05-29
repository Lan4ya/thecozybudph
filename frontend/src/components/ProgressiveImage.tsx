import { useState } from "react";
import { Skeleton } from "@/lib/ui/__shadcn__/skeleton";
import { cn } from "@/lib/utils/cn";

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  isEager?: boolean;
}

export function ProgressiveImage({
  src,
  isEager,
  className,
  alt,
  ...props
}: ProgressiveImageProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="relative h-full w-full">
      {!imgLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}

      <img
        src={src}
        alt={alt}
        loading={isEager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setImgLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          imgLoaded ? "opacity-100" : "opacity-0",
          className,
        )}
        {...props}
      />
    </div>
  );
}
