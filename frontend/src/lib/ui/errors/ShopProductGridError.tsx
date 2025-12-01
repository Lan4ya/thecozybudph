import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { useState } from "react";

interface ProductGridErrorProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ShopProductGridError = ({
  error,
  resetErrorBoundary,
}: ProductGridErrorProps) => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Failed to load products
          </DialogTitle>
        </DialogHeader>
        <div className="text-muted-foreground py-2">
          <p className="text-center px-2">
            {error.message ||
              "There was a problem with the product data. Please try again."}
          </p>
        </div>
        <DialogFooter className="justify-center">
          <Button onClick={resetErrorBoundary} variant="outline">
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
