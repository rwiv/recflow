import { it } from 'vitest';
import { processSets } from './set.js';

it('utils.set', () => {
  const setA = new Set([1, 2, 3, 4, 5]);
  const setB = new Set([3, 4, 5, 6, 7]);

  const result = processSets(setA, setB);
  console.log('Intersection:', result.intersection);
  console.log('New Set A:', result.newSetA);
  console.log('New Set B:', result.newSetB);
});
