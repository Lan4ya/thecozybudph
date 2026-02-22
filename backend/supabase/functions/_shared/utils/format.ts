export const formatPrice = (price = 0) => {
  const hasCentavos = !Number.isInteger(price);

  return price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: hasCentavos ? 2 : 0,
    maximumFractionDigits: hasCentavos ? 2 : 0,
  });
};
