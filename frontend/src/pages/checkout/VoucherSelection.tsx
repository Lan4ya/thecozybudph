{
  /* Voucher Selection */
}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.4 }}
  className="space-y-3"
>
  <label className="text-sm font-medium text-foreground">Apply Voucher</label>
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
          <div className="font-medium text-foreground">{voucher.name}</div>
          <div className="text-sm text-green-600 font-medium">
            {voucher.discount} discount
          </div>
        </div>
      </motion.label>
    ))}
  </div>
</motion.div>;
