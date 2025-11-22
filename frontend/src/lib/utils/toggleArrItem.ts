export default function toggleArrItem<T>(array: T[] | undefined, item: T): T[] {
  const arr = array ?? [];
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}
