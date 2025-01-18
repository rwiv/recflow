import {SoopWebhookAllocator, WebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findCandidateAddCnt} from "../utils.js";
import {SoopLiveInfo} from "../../client/types_soop.js";

export class SoopWebhookAllocatorMode1 implements SoopWebhookAllocator {

  constructor(private readonly query: QueryConfig) {}

  allocate(live: SoopLiveInfo, whStates: WebhookState[]): WebhookState | null {
    // type === "main"
    const candidate = findCandidateAddCnt(whStates, "main");
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findCandidateAddCnt(whStates, "extra");
  }
}
