export function randomElem<T>(array: readonly T[]) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error('Array is empty or not an array');
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}
