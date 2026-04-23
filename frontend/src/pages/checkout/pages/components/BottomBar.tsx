import { Button } from "@/lib/ui/__shadcn__/button";
import { Plus } from "lucide-react";

const BottomBar = ({ onCreate }: { onCreate: () => void }) => {
  return (
    <div className="flex-center fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/90 px-4 py-4 backdrop-blur md:px-6">
      <Button
        type="submit"
        onClick={onCreate}
        className="h-12 w-full rounded-2xl md:w-44"
      >
        <Plus /> Add address
      </Button>
    </div>
  );
};

export default BottomBar;
