import { WebhookRecord, WebhookType } from './types.js';

export function findChzzkCandidate(
  webhooks: WebhookRecord[],
  type: WebhookType,
): WebhookRecord | null {
  const candidates = webhooks
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.chzzkCapacity > wh.chzzkAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

export function findSoopCandidate(
  webhooks: WebhookRecord[],
  type: WebhookType,
): WebhookRecord | null {
  const candidates = webhooks
    .filter((wh) => wh.type === type)
    .filter((wh) => wh.soopCapacity > wh.soopAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return findMinCandidate(candidates);
  }
}

function findMinCandidate(candidates: WebhookRecord[]): WebhookRecord {
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
