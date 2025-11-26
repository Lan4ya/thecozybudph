import OrderSummary from "./components/OrderSummary";
import CartItem from "./components/CartItem";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

// Dummy cart data
const dummyCartItems = [
  {
    productId: "1",
    name: "Eternal Blossom Bouquet",
    price: 2500,
    imageUrl: "/api/placeholder/300/300",
    quantity: 2,
    selected: true,
    giftMessage: "Happy Birthday! Hope you love these flowers.",
  },
  {
    productId: "2",
    name: "Moonlight Roses",
    price: 1800,
    imageUrl: "/api/placeholder/300/300",
    quantity: 1,
    selected: true,
    giftMessage: "",
  },
  {
    productId: "3",
    name: "Spring Garden Vase",
    price: 3200,
    imageUrl: "/api/placeholder/300/300",
    quantity: 1,
    selected: false,
    giftMessage: "Congratulations on your new home!",
  },
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(dummyCartItems);

  // Calculate totals only for selected items
  const selectedItems = cartItems.filter((item) => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = selectedItems.length > 0 ? 150 : 0;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  // Toggle selection for individual item
  const toggleItemSelection = (productId: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId
          ? { ...item, selected: !item.selected }
          : item,
      ),
    );
  };

  // Toggle all items selection
  const toggleAllSelection = () => {
    const allSelected = cartItems.every((item) => item.selected);
    setCartItems((items) =>
      items.map((item) => ({ ...item, selected: !allSelected })),
    );
  };

  // Update gift message for an item
  const updateGiftMessage = (productId: string, message: string) => {
    setCartItems((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, giftMessage: message } : item,
      ),
    );
  };

  // Update quantity for an item
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

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCartItems((items) =>
      items.filter((item) => item.productId !== productId),
    );
  };

  const allSelected = cartItems.every((item) => item.selected);
  const someSelected = cartItems.some((item) => item.selected) && !allSelected;

  return (
    <div className="custom-container py-8 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
            Your Cart
          </h1>
          <p className="text-muted-foreground">
            Select items you want to checkout
          </p>
        </div>

        {/* Select All Toggle */}
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
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
            Select all items ({selectedItems.length}/{cartItems.length})
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <CartItem
                key={item.productId}
                {...item}
                onToggleSelection={() => toggleItemSelection(item.productId)}
                onUpdateGiftMessage={(message) =>
                  updateGiftMessage(item.productId, message)
                }
                onUpdateQuantity={(quantity) =>
                  updateQuantity(item.productId, quantity)
                }
                onRemove={() => removeItem(item.productId)}
              />
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              selectedCount={selectedItems.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
