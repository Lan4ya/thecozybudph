export const formatPrice = (price = 0) =>
  price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });
