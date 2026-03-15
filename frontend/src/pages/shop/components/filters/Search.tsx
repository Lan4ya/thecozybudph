import { useProductQueryState } from "../../../../features/shop/hooks/useProductQueryState";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Search = () => {
  const { productQuery, setProductQuery } = useProductQueryState();
  const [search, setSearch] = useState("");

  // sync local state with context state
  useEffect(() => {
    setSearch((productQuery.filters?.search as string) ?? "");
  }, [productQuery.filters?.search]);

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
    <div className="flex flex-col gap-2 w-full">
      <div className="">Search</div>
      <div className="relative w-full rounded-sm h-[45px]">
        <SearchIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          size={16}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border focus:ring-2 focus:ring-ring focus:outline-none rounded-md h-full w-full pl-10"
          type="search"
        />
      </div>
    </div>
  );
};

export default Search;
