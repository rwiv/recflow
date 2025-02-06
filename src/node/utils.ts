import { NodeRecord, NodePriority } from './types.js';

export function findChzzkCandidate(nodes: NodeRecord[], type: NodePriority): NodeRecord | null {
  const candidates = nodes
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.chzzkCapacity > wh.chzzkAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

export function findSoopCandidate(nodes: NodeRecord[], type: NodePriority): NodeRecord | null {
  const candidates = nodes
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.soopCapacity > wh.soopAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

function findMinCandidate(candidates: NodeRecord[]): NodeRecord {
  if (candidates.length === 0) {
    throw new Error('No candidate');
  }
  let candidate = candidates[0];
  for (const cur of candidates) {
    if (cur.chzzkAssignedCnt < candidate.chzzkAssignedCnt) {
      candidate = cur;
    }
  }
  return candidate;
}
