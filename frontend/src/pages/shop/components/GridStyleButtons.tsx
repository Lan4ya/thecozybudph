import { Button } from "@/lib/ui/__shadcn__/button";
import { Grid3x3, LayoutGrid } from "lucide-react";
import type { ProductCardProps } from "./ProductGrid";

type Props = {
  onCardTypeChange: (t: ProductCardProps["cardType"]) => void;
};

const GridStyleButtons = ({ onCardTypeChange }: Props) => {
  return (
    <>
      <Button
        variant="minimal"
        size="icon"
        className="border"
        onClick={() => onCardTypeChange("default")}
      >
        <Grid3x3 className="size-5 text-muted-foreground" />
      </Button>

      <Button
        variant="minimal"
        size="icon"
        className="border"
        onClick={() => onCardTypeChange("detailed")}
      >
        <LayoutGrid className="size-5 text-muted-foreground" />
      </Button>
    </>
  );
};

export default GridStyleButtons;
