export {};

declare global {
  interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    color_variants?: string[];
    image_url: string;
    // other types??
  }

  interface Orders {
    // some types
  }
}
