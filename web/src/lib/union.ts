export function checkType<T>(value: string | null | undefined, list: readonly T[]): T | null {
  if (value === null || value === undefined) {
    return null;
  }
  for (const elem of list) {
    if (elem === value) {
      return elem;
    }
  }
  return null;
}
