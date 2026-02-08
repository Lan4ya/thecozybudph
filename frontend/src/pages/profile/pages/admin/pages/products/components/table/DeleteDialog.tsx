import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import type { ProductWithRelations } from "@TheCozyBud/types";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DeleteProductDialog({
  product,
  onConfirm,
  isDeleting,
}: {
  product: ProductWithRelations;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          className={cn(isDeleting && "opacity-70 pointer-events-none")}
          aria-label={`Delete ${product.name}`}
        >
          {isDeleting ? <Spinner /> : <Trash2 className="size-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Product</DialogTitle>

          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="break-all font-medium text-foreground">
              {product.name}
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
              }}
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
