export function getSetDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter((item) => !setB.has(item)));
}

export function getSetIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter((item) => setB.has(item)));
}

export function processSets<T>(setA: Set<T>, setB: Set<T>): { intersection: Set<T>; newSetA: Set<T>; newSetB: Set<T> } {
  const intersection = getSetIntersection(setA, setB);
  const newSetA = getSetDifference(setA, intersection);
  const newSetB = getSetDifference(setB, intersection);

  return { intersection, newSetA, newSetB };
}

export function isEqualSet<T>(setA: Set<T>, setB: Set<T>) {
  if (setA.size !== setB.size) {
    return false;
  }
  for (let item of setA) {
    if (!setB.has(item)) return false;
  }
  return true;
}
