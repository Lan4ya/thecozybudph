import { formatPrice } from "@/lib/utils/format";
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
    // navigate("/shop");
    // await Promise.resolve(); // forces next tick, so react router does not batch the navigation processesing the navigation correctly
    navigate(`/shop/products/${productId}`);
  };

  return (
    <div onClick={handleClick}>
      <div className="group bg-card select-none text-card-foreground rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.95] active:shadow-lg">
        <div className="relative overflow-hidden">
          <ProductImage
            loading="lazy"
            src={imageUrl}
            className="pointer-events-none  aspect-square group-hover:scale-105 transition-transform duration-200 rounded-b-none"
          />
        </div>

        <div className="p-2  text-center">
          <h3 className="font-medium text-sm lg:text-base line-clamp-2 leading-tight text-foreground">
            {name}
          </h3>

          <div className="font-medium lg:text-lg text-primary">
            {formatPrice(price)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
