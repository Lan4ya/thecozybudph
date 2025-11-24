import { useFilters } from "../../hooks/useFilters";
import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

const Search = () => {
  const { filters, setFilters } = useFilters();
  const [search, setSearch] = useState("");

  // sync local state with global state
  useEffect(() => {
    setSearch((filters.search as string) ?? "");
  }, [filters.search]);

  // debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const nextVal = search.trim() || undefined;
      // avoid unnecessary updates
      if (filters.search !== nextVal) {
        setFilters((prev) => ({
          ...prev,
          search: nextVal,
        }));
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [search, filters.search, setFilters]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="">Search</div>
      <div className="relative w-full rounded-sm  h-10">
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
