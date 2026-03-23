import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import { cn } from "@/lib/utils/cn";
import { TableProperties, LayoutGrid, Search, Edit, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useProductsPageState } from "../hooks/useProductsPageState";

const TopBar = () => {
  const { setFormOpen, setEditingProduct } = useProductsPageState();

  const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchInputVal, setSearchInputVal] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  function handleSearchToggle() {
    setSearchOpen((p) => !p);
    if (isSearchOpen) {
      setSearchInputVal("");
    }
  }

  return (
    <div className="flex items-center rounded-lg justify-between">
      <div className="flex-center gap-3">
        <Button size="icon" variant="outline" className="">
          <TableProperties />
        </Button>

        <Button size="icon" variant="outline">
          <LayoutGrid />
        </Button>
        {/* <Button size="sm" variant="outline"> */}
        {/*   <Grid3x3 /> */}
        {/* </Button> */}
      </div>

      <div className="flex-center gap-3">
        {/* Search */}
        <div className="h-8 relative flex items-center justify-end">
          <Input
            ref={searchInputRef}
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            placeholder="Search..."
            className={cn(
              "transition-all duration-300 placeholder:text-xs placeholder:text-muted-foreground",
              isSearchOpen
                ? "opacity-100 w-[min(90%,222px)]  pr-12"
                : "opacity-0 w-0 p-0 border-0",
            )}
          />
          <Button
            variant="outline"
            size="sm"
            className={cn(
              isSearchOpen && "bg-transparent! hover:bg-accent/33! border-0",
              "absolute top-0 right-0",
            )}
            onClick={handleSearchToggle}
          >
            <Search />
          </Button>
        </div>

        {/* Edit Products */}
        <Button size="icon" variant="outline">
          <Edit />
        </Button>

        {/* Add Product */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingProduct(null);
            setFormOpen(true);
          }}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
};

export default TopBar;
