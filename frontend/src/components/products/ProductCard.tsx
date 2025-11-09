import { Button } from "@/lib/ui/__shadcn__/button";
import { ProductImage } from "./ProductImage";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";

type Props = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductCard = ({ name, imageUrl, price }: Props) => {
  return (
    <Card className="">
      <ProductImage src={imageUrl} />

      <CardFooter className="flex flex-col gap-2">
        <div className="line-clamp-2">{name}</div>
        <div className="font-bold">{price}</div>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
