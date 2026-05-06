import { formatPriceCents } from "@/lib/utils/format";
import { useNavigate } from "react-router";
import { ProductImage } from "./ProductImage";

type Props = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductCard = ({ productId, name, imageUrl, price }: Props) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(`/shop/products/${productId}`);
  };

  return (
    <div onClick={handleClick}>
      <div className="hover:scale-102 bg-card select-none text-card-foreground rounded-lg border-b border border-border/10 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.99] active:shadow-lg">
        <div className="relative overflow-hidden">
          <ProductImage
            loading="lazy"
            src={imageUrl}
            className="pointer-events-none aspect-square  transition-transform duration-200 rounded-b-none"
          />
        </div>

        <div className="p-2  text-center">
          <h3 className="capitalize font-medium text-sm lg:text-base line-clamp-2 leading-tight text-foreground">
            {name}
          </h3>

          <div className="font-medium text-primary">
            {formatPriceCents(price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
