import { Button } from "@/lib/ui/__shadcn__/button";
import { Grid3x3, LayoutGrid } from "lucide-react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils/cn";

const GridStyleButtons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get("view") === "detailed" ? "detailed" : "compact";

  const setView = (newView: "compact" | "detailed") => {
    const newParams = new URLSearchParams(searchParams);
    if (newView === "compact") {
      newParams.delete("view");
    } else {
      newParams.set("view", "detailed");
    }
    setSearchParams(newParams);
  };

  return (
    <>
      <Button
        variant="minimal"
        size="icon"
        className={cn(
          "border transition-colors",
          view === "compact" && "bg-accent/10 border-accent/50",
        )}
        onClick={() => setView("compact")}
      >
        <Grid3x3
          className={cn(
            "size-5",
            view === "compact" ? "text-accent" : "text-muted-foreground",
          )}
        />
      </Button>

      <Button
        variant="minimal"
        size="icon"
        className={cn(
          "border transition-colors",
          view === "detailed" && "bg-accent/10 border-accent/50",
        )}
        onClick={() => setView("detailed")}
      >
        <LayoutGrid
          className={cn(
            "size-5",
            view === "detailed" ? "text-accent" : "text-muted-foreground",
          )}
        />
      </Button>
    </>
  );
};

export default GridStyleButtons;
