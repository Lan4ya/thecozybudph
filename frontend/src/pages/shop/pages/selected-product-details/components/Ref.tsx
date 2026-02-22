{
  /* Quantity Selector */
}
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
</motion.div>;

{
  /* Action Buttons */
}
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
      onClick={handleAddToCart}
    >
      Add to Cart
    </Button>
  </motion.div>
</motion.div>;
