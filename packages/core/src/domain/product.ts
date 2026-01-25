export interface Product {
  id: string;
  name: string;
  colorVariants: string[];
  description: string | null;
  imageUrls: string[];
  price: number;
  primaryImageUrl: string;
  productCategoryId: string | null;
  productCollectionId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  category: {
    name: string | null;
  };
  collection: {
    name: string | null;
  };
}
