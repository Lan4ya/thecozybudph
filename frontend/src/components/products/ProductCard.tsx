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
      <div className="bg-card select-none text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer">
        {/* Image  */}
        <div className="relative overflow-hidden">
          <ProductImage
            loading="lazy"
            src={imageUrl}
            className="pointer-events-none aspect-square  transition-transform duration-200 rounded-b-none"
          />
        </div>

        <div className="px-2 py-2.5 text-center">
          <h3 className="capitalize font-medium text-sm lg:text-base leading-relaxed line-clamp-2 text-foreground">
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
