import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { formatPriceCents } from "@/lib/utils/format";

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  selectedCount: number;
}

const OrderSummary = ({
  subtotal,
  shipping,
  tax,
  total,
  selectedCount,
}: OrderSummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Order Summary {selectedCount > 0 && `(${selectedCount} items)`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedCount > 0 ? (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPriceCents(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPriceCents(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatPriceCents(tax)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Total</span>
                  <span>{formatPriceCents(total)}</span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Checkout Selected Items
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Free shipping on orders over ₱2,000
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No items selected</p>
            <p className="text-sm text-muted-foreground mt-2">
              Select items to proceed to checkout
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
