export function oneNotNull<T>(list: T[]): T {
  if (list.length === 0) {
    throw new Error('Expected exactly one element');
  }
  if (list.length > 1) {
    throw new Error('Expected exactly one element');
  }
  return list[0];
}

export function oneNullable<T>(list: T[]): T | undefined {
  if (list.length === 0) {
    return undefined;
  }
  if (list.length > 1) {
    throw new Error('Expected exactly one element');
  }
  return list[0];
}

export function hasDuplicates(arr: string[]): boolean {
  return new Set(arr).size !== arr.length;
}
