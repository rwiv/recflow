import {ChzzkLiveInfo} from "../../client/types_chzzk.js";
import {ChzzkWebhookAllocator, WebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findCandidateAddCnt} from "../utils.js";

export class ChzzkWebhookAllocatorMode1 implements ChzzkWebhookAllocator {

  constructor(private readonly query: QueryConfig) {}

  allocate(live: ChzzkLiveInfo, whStates: WebhookState[]): WebhookState | null {
    // type === "main"
    const candidate = findCandidateAddCnt(whStates, "main");
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findCandidateAddCnt(whStates, "extra");
  }
}
