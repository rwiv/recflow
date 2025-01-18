import {ChzzkWebhookState, SoopWebhookState, WebhookType} from "./types.js";

export function findChzzkCandidate(whStates: ChzzkWebhookState[], type: WebhookType): ChzzkWebhookState | null {
  const candidates = whStates
    .filter(wh => wh.type === type)
    .filter(wh => wh.chzzkCapacity > wh.chzzkAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return candidates[0];
  }
}

export function findSoopCandidate(whStates: SoopWebhookState[], type: WebhookType): SoopWebhookState | null {
  const candidates = whStates
    .filter(wh => wh.type === type)
    .filter(wh => wh.soopCapacity > wh.soopAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    return candidates[0];
  }
}
