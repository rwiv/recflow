import { describe, it, expect } from 'vitest';
import { sortedByEarliestAssigned } from './node.selector.js';

describe('ChannelService', () => {
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
