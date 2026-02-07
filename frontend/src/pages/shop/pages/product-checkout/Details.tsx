import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Shield, Truck, Clock, Gift } from "lucide-react";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Textarea } from "@/lib/ui/__shadcn__/textarea";
import type { GetProductResponse } from "@TheCozyBud/types";

interface ProductDetailsProps {
  product: GetProductResponse;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVoucher, setSelectedVoucher] = useState<string>("");
  const [cardMessage, setCardMessage] = useState("");

  const vouchers = [
    { id: "voucher1", name: "Birthday Special - 10% Off", discount: "10%" },
    { id: "voucher2", name: "First Order - 15% Off", discount: "15%" },
    { id: "voucher3", name: "Seasonal Offer - 20% Off", discount: "20%" },
  ];

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" max-[380px]:px-2! px-4 lg:px-0 max-w-2xl space-y-8"
    >
      {/* Product Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.name}
            </h1>
            <p className="text-lg text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
          <button className="p-2 hover:bg-accent rounded-full transition-colors">
            <Heart className="w-6 h-6 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Rating and Reviews */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-4 h-4 fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="ml-2 text-sm font-medium">4.8</span>
          </div>
          <span className="text-sm text-muted-foreground">(128 reviews)</span>
          <span className="text-sm text-green-600 font-medium">In Stock</span>
        </div>
      </div>

      {/* Price Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.price > 50 && (
            <span className="text-lg text-muted-foreground line-through">
              {formatPrice(product.price * 1.2)}
            </span>
          )}
          {product.price > 50 && (
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
              Save 20%
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Free delivery on orders over $50
        </p>
      </motion.div>

      {/* Card Message Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Gift className="w-4 h-4" />
          Add a card message (optional)
        </label>
        <Textarea
          placeholder="Write your heartfelt message here..."
          value={cardMessage}
          onChange={(e) => setCardMessage(e.target.value)}
          className="min-h-[80px] resize-none border-border/50 focus:border-primary transition-colors"
          maxLength={200}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Included free with your flowers</span>
          <span>{cardMessage.length}/200</span>
        </div>
      </motion.div>

      {/* Voucher Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <label className="text-sm font-medium text-foreground">
          Apply Voucher
        </label>
        <div className="space-y-2">
          {vouchers.map((voucher) => (
            <motion.label
              key={voucher.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-3 border border-border/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
            >
              <input
                type="radio"
                name="voucher"
                value={voucher.id}
                checked={selectedVoucher === voucher.id}
                onChange={(e) => setSelectedVoucher(e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {voucher.name}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {voucher.discount} discount
                </div>
              </div>
            </motion.label>
          ))}
        </div>
      </motion.div>

      {/* Quantity Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <label className="text-sm font-medium text-foreground">Quantity</label>
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-lg">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={decrementQuantity}
              className="p-3 hover:bg-accent transition-colors rounded-l-lg"
              disabled={quantity <= 1}
            >
              <span className="text-lg font-medium">-</span>
            </motion.button>
            <span className="px-6 py-3 text-lg font-medium min-w-[60px] text-center">
              {quantity}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={incrementQuantity}
              className="p-3 hover:bg-accent transition-colors rounded-r-lg"
            >
              <span className="text-lg font-medium">+</span>
            </motion.button>
          </div>
          <div className="text-sm text-muted-foreground">
            {quantity} × {formatPrice(product.price)} ={" "}
            <span className="font-medium text-foreground">
              {formatPrice(product.price * quantity)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            Buy Now
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary/10"
          >
            Add to Cart
          </Button>
        </motion.div>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border/30"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-sm">Free Delivery</div>
            <div className="text-xs text-muted-foreground">
              On orders over $50
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-sm">Quality Guarantee</div>
            <div className="text-xs text-muted-foreground">
              Freshness assured
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-full">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-sm">Same Day Delivery</div>
            <div className="text-xs text-muted-foreground">
              Order before 2PM
            </div>
          </div>
        </div>
      </motion.div>

      {/* Product Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-4 pt-6 border-t border-border/30"
      >
        <h3 className="text-lg font-semibold">Product Details</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Beautifully arranged fresh flowers perfect for any occasion. Each
            bouquet is handcrafted by our expert florists to ensure the highest
            quality and freshness.
          </p>
          <p>
            Includes care instructions and guaranteed to bring smiles to your
            loved ones. Perfect for birthdays, anniversaries, or just to show
            you care.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetails;
