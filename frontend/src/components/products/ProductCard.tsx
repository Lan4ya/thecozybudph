import { formatPrice } from "@/lib/utils/format";
import { ProductImage } from "./ProductImage";

type Props = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
};

// const ProductCard = ({ name, imageUrl, price }: Props) => {
//   return (
//     <div className="group active:scale-95 bg-card text-card-foreground rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer">
//       <div className="relative overflow-hidden">
//         <ProductImage
//           src={imageUrl}
//           className="group-active:scale-110 aspect-square group-hover:scale-105 transition-transform duration-300 rounded-b-none"
//         />
//       </div>
//
//       <div className="p-2 space-y-1 text-center">
//         <h3 className="font-medium text-sm lg:text-base line-clamp-2 leading-tight text-foreground">
//           {name}
//         </h3>
//         <div className="font-medium lg:text-lg text-primary">
//           {formatPrice(price)}
//         </div>
//       </div>
//     </div>
//   );
// };

const ProductCard = ({ name, imageUrl, price }: Props) => {
  return (
    <div className="group bg-card select-none text-card-foreground rounded-lg border border-border/30 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer active:scale-[0.95] active:shadow-lg">
      <div className="relative overflow-hidden">
        <ProductImage
          src={imageUrl}
          className="pointer-events-none  aspect-square group-hover:scale-105 transition-transform duration-200 rounded-b-none"
        />
      </div>

      <div className="p-2 space-y-1 text-center">
        <h3 className="font-medium text-sm lg:text-base line-clamp-2 leading-tight text-foreground">
          {name}
        </h3>
        <div className="font-medium lg:text-lg text-primary">
          {price.toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
