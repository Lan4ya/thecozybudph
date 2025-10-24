import React from "react";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";

const items = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: i % 2 === 0 ? "Dried Bouquet" : "Mini Vase Set",
  subtitle: "Handpicked · Ready to ship",
  price: i % 2 === 0 ? "₱1,250" : "₱950",
}));

const Home: React.FC = () => {
  return (
    <main className="flex-1 flex flex-col gap-15">
      <Hero />
      <ProductGrid items={items} />
      <div className="container mx-auto py-8 flex justify-center">
        <button
          className="px-6 py-2 rounded-md"
          style={{
            background: "transparent",
            border: "1px dashed var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          View all
        </button>
      </div>
    </main>
  );
};

export default Home;
