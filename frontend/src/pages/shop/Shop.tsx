import React from "react";
import ShopHero from "./components/ShopHero";
import ShopProductGrid from "./components/ShopProductGrid";
import ShopEventSection from "./components/ShopEventSection";

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: i % 2 === 0 ? "Dried Bouquet" : "Mini Vase Set",
  subtitle: "Handpicked · Ready to ship",
  price: i % 2 === 0 ? "₱1,250" : "₱950",
}));

const Shop: React.FC = () => {
  return (
    <main className="overflow-x-hidden flex-1 flex flex-col gap-15">
      {/* <ShopHero /> */}
      <ShopProductGrid items={items} />
      {/* <ShopEventSection /> */}
    </main>
  );
};

export default Shop;
