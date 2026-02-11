export interface Product {
  id: string;
  name: string;
  colorVariants: string[];
  description: string | null;
  imageUrls: string[];
  price: number;
  formattedPrice: string;
  primaryImageUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export type ProductWithRelations = Product & {
  categoryName: string | null;
  collectionName: string | null;
};

export type DeleteProducts = { deletedProductIds: string[] };

export type ProductCategory = {
  id: string;
  name: string;
};

export type ProductCollection = {
  id: string;
  name: string;
};
