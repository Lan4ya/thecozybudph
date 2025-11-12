export const formatPrice = (price: number) =>
  price.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
  });

export function formatFileSize(n: number) {
  return n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} kB`
      : `${(n / 1048576).toFixed(1)} MB`;
}
