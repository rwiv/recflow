export function checkType<T>(value: string | null | undefined, list: readonly T[]): T | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  for (const elem of list) {
    if (elem === value) {
      return elem;
    }
  }
  return undefined;
}
