import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";
import type { Product } from "@TheCozyBud/types";

export function DeleteProductDialog({
  product,
  onConfirm,
  trigger,
}: {
  product: Product;
  onConfirm: () => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="mb-2 flex items-center gap-2 text-destructive">
            Delete Product
          </DialogTitle>

          <DialogDescription className="">
            Are you sure you want to delete{" "}
            <span className="break-all font-medium text-foreground">
              {product.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
