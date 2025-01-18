import {WebhookState, WebhookType} from "./types.js";

export function findCandidateAddCnt(whStates: WebhookState[], type: WebhookType): WebhookState | null {
  const candidates = whStates
    .filter(wh => wh.type === type)
    .filter(wh => wh.chzzkCapacity > wh.chzzkAssignedCnt);

  if (candidates.length === 0) {
    return null;
  } else {
    const candidate = candidates[0];
    candidate.chzzkAssignedCnt++;
    return candidate;
  }
}
