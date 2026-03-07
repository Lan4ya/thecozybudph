import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
import { useState } from "react";

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
  const [diagOpen, setDiagOpen] = useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel(); // cleanup when dialog closes
      }}
    >
      {/* @ts-ignore */}
      {/* <DialogTrigger asChild> */}
      {/*   <Button */}
      {/*     variant="destructive" */}
      {/*     size="sm" */}
      {/*     disabled={isDeleting} */}
      {/*     className={cn(isDeleting && "opacity-70 pointer-events-none")} */}
      {/*     aria-label={`Delete ${product.name}`} */}
      {/*   > */}
      {/*     {isDeleting ? <Spinner /> : <Trash2 className="size-4" />} */}
      {/*   </Button> */}
      {/* </DialogTrigger> */}
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <VisuallyHidden>
            {/* @ts-ignore */}
            <DialogTitle className="text-destructive">Delete Item</DialogTitle>
          </VisuallyHidden>

          <DialogDescription>
            {deletingItemCount > 1
              ? `Do you want to remove ${deletingItemCount} items?`
              : "Do you want to remove this item?"}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex">
          {/* @ts-ignore */}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          {/* @ts-ignore */}
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
