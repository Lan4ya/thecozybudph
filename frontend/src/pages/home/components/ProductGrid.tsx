import React from "react";
import ProductCard from "./ProductCard";

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
};

const ProductGrid: React.FC<{ items: Item[] }> = ({ items }) => {
  return (
    <section className="container mx-auto py-8">
      <h2
        className="text-26-bold text-center mb-6"
        style={{ color: "var(--color-secondary)" }}
      >
        Recommendations
      </h2>

      <div
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        }}
      >
        {/* Responsive columns using tailwind utilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <ProductCard
              key={it.id}
              title={it.title}
              subtitle={it.subtitle}
              price={it.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
