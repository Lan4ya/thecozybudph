// Overload 1: plain string array
export function searchSubstring(arr: string[], query: string): string[];

// Overload 2: array of arbitrary items with selector
export function searchSubstring<T>(
  arr: T[],
  query: string,
  selector: (item: T) => string,
): T[];

export default function searchSubstring<T>(
  arr: T[],
  query: string,
  selector?: (item: T) => string,
): T[] {
  const q = query.trim().toLowerCase();

  if (selector) {
    return arr.filter((item) => selector(item).toLowerCase().includes(q));
  }

  // If no selector, T must be string here
  return (arr as unknown as string[]).filter((str) =>
    str.toLowerCase().includes(q),
  ) as unknown as T[];
}
