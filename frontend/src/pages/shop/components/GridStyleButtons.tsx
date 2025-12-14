import { Button } from "@/lib/ui/__shadcn__/button";
import { Grid3x3, LayoutGrid } from "lucide-react";

const GridStyleButtons = () => {
  return (
    <>
      <Button variant="minimal" size="icon" className="border">
        <Grid3x3 className="size-5 text-muted-foreground" />
      </Button>

      <Button variant="minimal" size="icon" className="border">
        <LayoutGrid className="size-5 text-muted-foreground" />
      </Button>

      {/* <Button variant="minimal" size="icon" className="border"> */}
      {/*   <TableProperties className="size-5 rotate-180 text-muted-foreground" /> */}
      {/* </Button> */}
    </>
  );
};

export default GridStyleButtons;
