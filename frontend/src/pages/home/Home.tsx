import React from "react";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import EventSection from "./components/EventSection";

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: i % 2 === 0 ? "Dried Bouquet" : "Mini Vase Set",
  subtitle: "Handpicked · Ready to ship",
  price: i % 2 === 0 ? "₱1,250" : "₱950",
}));

const Home: React.FC = () => {
  return (
    <main className="overflow-x-hidden flex-1 flex flex-col gap-15">
      <Hero />
      <ProductGrid items={items} />
      <EventSection />
    </main>
  );
};

export default Home;
