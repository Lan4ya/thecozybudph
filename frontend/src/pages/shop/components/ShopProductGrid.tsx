import React, { useState } from "react";
import ShopProductCard from "./ShopProductCard";

type Item = {
  id: string;
  title: string;
  subtitle?: string;
  price?: string;
  originalPrice?: string;
  rating?: string;
  sold?: number;
  discount?: string;
  image?: string;
  freeShipping?: boolean;
  isOfficial?: boolean;
  location?: string;
};

const categories = [
  { id: "all", name: "All Items", count: 50 },
  { id: "bouquet", name: "Bouquets", count: 15 },
  { id: "vase", name: "Vases", count: 12 },
  { id: "pottery", name: "Pottery", count: 10 },
  { id: "decor", name: "Home Decor", count: 13 },
];

const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const ShopProductGrid: React.FC<{ items: Item[] }> = ({ items }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items
    .filter(item => {
      const matchesCategory = selectedCategory === "all" || 
        item.title.toLowerCase().includes(selectedCategory);
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseInt(a.price?.replace("₱", "").replace(",", "") || "0") - 
                 parseInt(b.price?.replace("₱", "").replace(",", "") || "0");
        case "price-high":
          return parseInt(b.price?.replace("₱", "").replace(",", "") || "0") - 
                 parseInt(a.price?.replace("₱", "").replace(",", "") || "0");
        case "rating":
          return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
        case "latest":
          return parseInt(b.id) - parseInt(a.id);
        default:
          return parseInt(String(b.sold)) - parseInt(String(a.sold));
      }
    });

  return (
    <section className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Sticky */}
        <div className="lg:w-64 shrink-0">
          <div className="sticky top-8 bg-white rounded-lg p-4 border shadow-sm h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex justify-between items-center w-full text-left px-2 py-1 rounded ${
                    selectedCategory === category.id 
                      ? "bg-blue-50 text-blue-600 font-medium" 
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2
              className="text-26-bold"
              style={{ color: "var(--color-secondary)" }}
            >
              Shop Products
            </h2>

            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ShopProductCard
                key={item.id}
                title={item.title}
                subtitle={item.subtitle}
                price={item.price}
                originalPrice={item.originalPrice}
                rating={item.rating}
                sold={item.sold}
                discount={item.discount}
                image={item.image}
                freeShipping={item.freeShipping}
                isOfficial={item.isOfficial}
                location={item.location}
              />
            ))}
          </div>

          {/* View All Button */}
          <div className="mx-auto py-8 flex justify-center">
            <button
              className="px-6 py-2 rounded-md"
              style={{
                background: "transparent",
                border: "1px dashed var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
            >
              Load More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopProductGrid;