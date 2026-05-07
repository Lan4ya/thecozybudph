import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { ProductImage } from "./ProductImage";
import type { ProductListItem } from "@TheCozyBud/schemas";

type Props = {
  product: ProductListItem;
};

const ProductCardDetailed = ({ product }: Props) => {
  const {
    id: productId,
    name,
    primaryImageUrl,
    description,
    minPriceCents,
    collection,
    category,
  } = product;
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(`/shop/products/${productId}`);
  };

  return (
    <div
      className="group bg-card grid grid-cols-[auto_1fr] select-none text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer  active:shadow-lg"
      onClick={handleClick}
    >
      {/* Image */}
      <div className="h-62 overflow-hidden">
        <ProductImage
          loading="lazy"
          src={primaryImageUrl}
          className="pointer-events-none aspect-3/4 transition-transform duration-200 rounded-b-none"
        />
      </div>

      {/* Details */}
      <div className="flex flex-col p-4 min-w-0">
        <div className="space-y-2">
          {/* Title + Category */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="capitalize line-clamp-2 text-base lg:text-lg font-semibold leading-snug">
              {name}
            </h3>

            <span className="shrink-0 rounded-xl bg-accent/10 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-accent">
              {category}
            </span>
          </div>

          {/* Price */}
          <div className="text-lg font-semibold text-primary">
            {formatPriceCents(minPriceCents)}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Metadata row */}
        <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
          {collection && (
            <span className="capitalize rounded-xl border border-border/30 bg-background px-2 py-1 text-[11px] text-muted-foreground">
              {collection}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCardDetailed;
