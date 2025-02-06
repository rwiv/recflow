export function checkType<T, R>(value: T | null | undefined, list: readonly R[]): R | undefined {
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
