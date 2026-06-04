import { cn } from "@/lib/utils/cn";
import { useProductsFilterAndSortState } from "../../hooks/useProductsFilterAndSortState";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Props = { className?: string };

const Search = ({ className }: Props) => {
  const { productQuery, setProductQuery } = useProductsFilterAndSortState();
  const [search, setSearch] = useState(
    (productQuery.filters?.search as string) ?? "",
  );

  // debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const nextVal = search.trim() || undefined;
      // avoid unnecessary updates
      if (productQuery.filters?.search !== nextVal) {
        setProductQuery((prev) => ({
          ...prev,
          filters: {
            ...prev.filters,
            search: nextVal,
          },
        }));
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [search, productQuery.filters?.search, setProductQuery]);

  return (
    <div className={cn("relative w-full rounded-sm h-[45px]", className)}>
      <SearchIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <input
        // placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border focus:ring-2 focus:ring-ring focus:outline-none rounded-md h-full w-full pl-10"
        type="search"
      />
    </div>
  );
};

export default Search;
