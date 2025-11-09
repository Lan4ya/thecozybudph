export const formatPrice = (price: number) =>
  price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
