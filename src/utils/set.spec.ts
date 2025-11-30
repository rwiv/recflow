import { describe, expect, it } from 'vitest';

import { processSets } from '@/utils/set.js';

describe('utils.set', () => {
  it('processSets', () => {
    const setA = new Set([1, 2, 3, 4, 5]);
    const setB = new Set([3, 4, 5, 6, 7]);

    const result = processSets(setA, setB);
    expect(result.intersection).toEqual(new Set([3, 4, 5]));
    expect(result.newSetA).toEqual(new Set([1, 2]));
    expect(result.newSetB).toEqual(new Set([6, 7]));
  });
});
