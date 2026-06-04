import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/lib/ui/__shadcn__/dialog";
import { DialogClose } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export function DeleteCartItemDialog({
  open,
  onCancel,
  onConfirm,
  isDeleting,
  deletingItemCount,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  deletingItemCount: number;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel(); // cleanup when dialog closes
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle className="text-destructive">Delete Item</DialogTitle>
          </VisuallyHidden>

          <DialogDescription>
            {deletingItemCount > 1
              ? `Do you want to remove ${deletingItemCount} items?`
              : "Do you want to remove this item?"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
