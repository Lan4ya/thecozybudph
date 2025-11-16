export type ProductDB = {
  id: string;
  name: string;
  price: number;
  color_variants: string[];
  description?: string | null;
  image_urls: string[];
  primary_image_url: string;
  product_collection_id: number | null;
  created_at: string;
  updated_at: string;
};

export type ProducbCollectionDB = {
  id: string;
  name: string;
};
