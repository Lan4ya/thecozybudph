import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-center py-2  border-b border-border/40"
    >
      <h1 className="text-header">Checkout</h1>
    </motion.header>
  );
};

export default Header;
