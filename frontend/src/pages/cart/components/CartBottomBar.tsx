import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";

interface CartBottomBarProps {
  allItemsSelected: boolean;
  toggleAllSelection: () => void;
  selectedCount: number;
  totalCount: number;
  isEditingCart: boolean;
  onDelete: () => void;
  subtotalCents: number;
  hasNoItems: boolean;
  onCheckout: () => void;
}

export const CartBottomBar = ({
  allItemsSelected,
  toggleAllSelection,
  selectedCount,
  totalCount,
  isEditingCart,
  onDelete,
  subtotalCents,
  hasNoItems,
  onCheckout,
}: CartBottomBarProps) => {
  if (totalCount === 0) return null;

  return (
    <div className="fixed left-0 bottom-0 w-full z-10  border">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3 p-4">
        {/* Select all checkbox + label */}
        <div className="flex-center gap-2">
          <div
            onClick={toggleAllSelection}
            className={cn(
              "flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all",
              allItemsSelected
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground hover:border-primary",
            )}
          >
            {allItemsSelected && <Check className="size-3" />}
          </div>
          <span
            className="text-sm lg:text-base font-medium cursor-pointer select-none"
            onClick={toggleAllSelection}
          >
            Select all ({selectedCount}/{totalCount})
          </span>
        </div>

        {/* Right side: edit mode delete, or checkout */}
        {isEditingCart ? (
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        ) : (
          <div className="flex gap-2 items-center">
            {subtotalCents !== 0 && (
              <span className="text-sm">{formatPriceCents(subtotalCents)}</span>
            )}
            <Button
              disabled={hasNoItems}
              variant="secondary"
              onClick={onCheckout}
            >
              Check Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
