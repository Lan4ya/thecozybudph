import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/lib/ui/__shadcn__/dialog";
import { Button } from "@/lib/ui/__shadcn__/button";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { cn } from "@/lib/utils/cn";

export function DeleteProductDialog({
  onConfirm,
  deleteLoading,
  deletingCount,
  className,
}: {
  onConfirm: () => void;
  deleteLoading: boolean;
  deletingCount: number;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={deleteLoading}
          className={cn(
            deleteLoading && "opacity-70 pointer-events-none",
            className,
          )}
          aria-label={`Delete product`}
        >
          {deleteLoading && <Spinner />} Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Delete Product</DialogTitle>

          <DialogDescription>
            {deletingCount > 1
              ? `Do you want to remove ${deletingCount} products`
              : "Do you want to remove this product?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex justify-end gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <DialogClose asChild>
            <Button variant="destructive" onClick={onConfirm}>
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
