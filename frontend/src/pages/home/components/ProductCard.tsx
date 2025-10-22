import React from "react";
import { Heart } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";

type Props = {
  title: string;
  subtitle?: string;
  price?: string;
  index?: number;
};

const ProductCard: React.FC<Props> = ({ title, subtitle, price }) => {
  return (
    <article
      className="flex flex-col items-center text-center bg-white/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      role="group"
    >
      <div className="relative w-full">
        <div className="w-full h-36 md:h-44 rounded-xl flex items-center justify-center overflow-hidden bg-[var(--color-muted)]/30">
          {/* stylized placeholder image — keeps layout intact */}
          <div className="text-5xl select-none">🌸</div>
        </div>

        <Button
          variant="minimal"
          size="auto"
          className="absolute top-3 right-3 bg-white/70 hover:bg-white"
          aria-label="favorite"
        >
          <Heart className="size-4" />
        </Button>
      </div>

      <div className="mt-4 w-full">
        <h3
          className="text-[15px] font-medium text-ellipsis overflow-hidden whitespace-nowrap"
          style={{ color: "var(--color-card-foreground)" }}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-12-normal mt-1 text-muted-foreground">
            {subtitle}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span
            className="text-16-medium"
            style={{ color: "var(--color-secondary)" }}
          >
            {price}
          </span>
          <Button variant="default" size="sm">
            Add
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
