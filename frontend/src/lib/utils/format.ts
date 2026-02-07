export const formatPrice = (price = 0) =>
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

export const capitalizeFirstLetter = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const capitalizeFirstLetterOfEachWord = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export const parseDateString = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};

export const getUnknownErrMsg = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
};
