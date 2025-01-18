import {ChzzkLiveInfo} from "../../client/types_chzzk.js";
import {ChzzkWebhookAllocator, WebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findCandidateAddCnt} from "../utils.js";

export class ChzzkWebhookAllocatorMode2 implements ChzzkWebhookAllocator {

  constructor(private readonly query: QueryConfig) {}

  allocate(live: ChzzkLiveInfo, whStates: WebhookState[]): WebhookState | null {
    let type: WebhookType = "main";
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = "extra";
    }

    if (type === "main") {
      const candidate = findCandidateAddCnt(whStates, "main");
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findCandidateAddCnt(whStates, "extra");
  }
}
