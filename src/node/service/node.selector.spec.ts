import { describe, expect, it } from 'vitest';

import { sortedByEarliestAssigned } from '@/node/service/node.selector.js';

describe('NodeSelector', () => {
  it('sortedByEarliestAssigned', () => {
    const nodes: any[] = [
      { id: '1', lastAssignedAt: new Date('2021-01-03') },
      { id: '2', lastAssignedAt: null },
      { id: '3', lastAssignedAt: new Date('2021-01-02') },
      { id: '4', lastAssignedAt: null },
      { id: '5', lastAssignedAt: null },
    ];
    const sorted = sortedByEarliestAssigned(nodes);
    expect(sorted[0].lastAssignedAt).toBe(null);
  });
});
