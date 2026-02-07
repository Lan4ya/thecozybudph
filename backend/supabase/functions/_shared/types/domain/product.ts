export interface Product {
  id: string;
  name: string;
  colorVariants: string[];
  description?: string;
  imageUrls: string[];
  price: number;
  primaryImageUrl: string;
  categoryName?: string;
  collectionName?: string;
  createdAt: Date;
  updatedAt: Date;
}
