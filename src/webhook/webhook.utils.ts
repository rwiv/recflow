import { WebhookState, WebhookType } from './types.js';

export function findChzzkCandidate(
  whStates: WebhookState[],
  type: WebhookType,
): WebhookState | null {
  const candidates = whStates
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.chzzkCapacity > wh.chzzkAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

export function findSoopCandidate(
  whStates: WebhookState[],
  type: WebhookType,
): WebhookState | null {
  const candidates = whStates
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.soopCapacity > wh.soopAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

function findMinCandidate(candidates: WebhookState[]): WebhookState {
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
