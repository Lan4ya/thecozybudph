import type {
  CartItem as CartItemType,
  Product,
  ProductVariant,
} from "@TheCozyBud/types";
import CartItem from "./components/CartItem";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useEffect, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { formatPriceCents } from "@/lib/utils/format";
import { CartAPI } from "@/api/cart";
import { ProductAPI } from "@/api/product";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

export type CartItemUI = CartItemType & {
  name: string;
  imageUrl: string;
  selected: boolean;
  cardMessage: string;
};

const Cart = () => {
  const navigate = useNavigate();

  const cartItemsQuery = useQuery<CartItemType[]>({
    queryKey: ["cart"],
    queryFn: CartAPI.getCartItems,
  });

  const productIds = cartItemsQuery.data?.map((i) => i.productId) ?? [];

  const productsQuery = useQuery({
    queryKey: ["products", productIds],
    queryFn: () => ProductAPI.getByIds(productIds),
  });

  useEffect(() => {
    console.log("Cart Items:", cartItemsQuery.data);
    console.log("Products:", productsQuery.data);
  }, [cartItemsQuery.data, productsQuery.data]);

  const productMap = new Map(productsQuery.data?.map((p) => [p.id, p]));

  const hydrateCartItems = (): CartItemUI[] => {
    return (
      cartItemsQuery.data?.map((c) => {
        const product = productMap.get(c.productId);
        return {
          name: product?.name ?? "Unknown",
          productId: c.productId,
          imageUrl: product?.primaryImageUrl ?? "",
          quantity: c.quantity,
          productVariant: c.productVariant,
          selected: false,
          cardMessage: "",
        };
      }) ?? []
    );
  };

  const [cartItems, setCartItems] = useState<CartItemUI[]>([]);

  useEffect(() => {
    if (cartItemsQuery.data && productsQuery.data) {
      setCartItems(hydrateCartItems());
    }
  }, [cartItemsQuery.data, productsQuery.data]);

  // Calculate totals only for selected items
  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.productVariant.priceCents * item.quantity,
    0,
  );
  const shipping = selectedItems.length > 0 ? 150 : 0;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  const toggleItemSelection = (productId: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems((items) =>
      items.map((item) => ({ ...item, selected: !allSelected })),
    );
  };

  const updateCardMessage = (productId: string, message: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, cardMessage: message } : item,
      ),
    );
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId),
    );
  };

  const allSelected = cartItems.every((item) => item.selected);
  const someSelected = cartItems.some((item) => item.selected) && !allSelected;

  return (
    <>
      <div className="custom-container pt-4 pb-25 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <Button variant="minimal" size="auto" onClick={() => navigate(-1)}>
              <ArrowLeft />
            </Button>

            <h1 className="text-xl lg:text-2xl font-bold text-foreground">
              Your Cart
            </h1>

            <Button
              variant="minimal"
              size="auto"
              className="text-foreground"
              onClick={() => null}
            >
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cartItems.map((item) => (
                <CartItem
                  key={`${item.productId}-${item.productVariant.sku}`}
                  {...item}
                  onToggleSelection={() => toggleItemSelection(item.productId)}
                  onUpdateCardMessage={(message) =>
                    updateCardMessage(item.productId, message)
                  }
                  onUpdateQuantity={(quantity) =>
                    updateQuantity(item.productId, quantity)
                  }
                  onRemove={() => removeItem(item.productId)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Select All Toggle */}
      <div className="fixed left-0 bottom-0 w-full z-10 flex items-center justify-between gap-3 p-4 bg-card border">
        <div className="flex gap-2">
          <div
            onClick={toggleAllSelection}
            className={cn(
              "flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all",
              allSelected
                ? "bg-primary border-primary text-primary-foreground"
                : someSelected
                  ? "bg-primary/50 border-primary text-primary-foreground"
                  : "border-muted-foreground hover:border-primary",
            )}
          >
            {allSelected && <Check className="size-3" />}
            {someSelected && <Check className="size-3" />}
          </div>
          <span
            className="text-sm font-medium cursor-pointer select-none"
            onClick={toggleAllSelection}
          >
            Select all ({selectedItems.length}/{cartItems.length})
          </span>
        </div>

        <div className="flex gap-2 items-center">
          <span className="text-sm">{formatPriceCents(subtotal)}</span>

          <Button
            // size=""
            className=" bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Check Out
          </Button>
        </div>
      </div>
    </>
  );
};

export default Cart;
