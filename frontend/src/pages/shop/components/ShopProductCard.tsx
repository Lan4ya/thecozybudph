import React from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";

type Props = {
  title: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  rating?: string;
  sold?: number;
  discount?: string;
  image?: string;
  freeShipping?: boolean;
  isOfficial?: boolean;
  location?: string;
};

const ShopProductCard: React.FC<Props> = ({ 
  title, 
  subtitle, 
  price, 
  originalPrice,
  rating,
  sold,
  discount,
  image,
  freeShipping,
  isOfficial,
  location
}) => {
  return (
    <article
      className="flex flex-col bg-white/60 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
      role="group"
    >
      <div className="relative w-full">
        <div className="w-full h-36 md:h-44 rounded-xl flex items-center justify-center overflow-hidden bg-[var(--color-muted)]/30">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-5xl select-none">🌸</div>
          )}
        </div>

        {discount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            {discount}
          </span>
        )}

        {isOfficial && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Official
          </span>
        )}

        <Button
          variant="minimal"
          size="auto"
          className="absolute top-10 right-2 bg-white/70 hover:bg-white"
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

        {/* Rating and Sold Info */}
        {(rating || sold) && (
          <div className="flex items-center gap-2 mt-2">
            {rating && (
              <div className="flex items-center">
                <Star className="size-3 fill-orange-400 text-orange-400" />
                <span className="text-xs text-gray-600 ml-1">{rating}</span>
              </div>
            )}
            {sold && (
              <>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{sold} sold</span>
              </>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span
              className="text-16-medium font-bold"
              style={{ color: "var(--color-secondary)" }}
            >
              {price}
            </span>
            {originalPrice && (
              <span className="text-12-normal text-gray-400 line-through">
                {originalPrice}
              </span>
            )}
          </div>
          <Button variant="default" size="sm">
            Add
          </Button>
        </div>

        {/* Shipping and Location */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>{freeShipping ? "Free Shipping" : "Shipping: ₱50"}</span>
          <span>{location}</span>
        </div>
      </div>
    </article>
  );
};

export default ShopProductCard;