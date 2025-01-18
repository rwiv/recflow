import {ChzzkLiveInfo} from "../../client/types_chzzk.js";
import {ChzzkWebhookAllocator, WebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findCandidateAddCnt} from "../utils.js";

export class ChzzkWebhookAllocatorMode4 implements ChzzkWebhookAllocator {

  constructor(private readonly query: QueryConfig) {}

  allocate(live: ChzzkLiveInfo, whStates: WebhookState[]): WebhookState | null {
    let type: WebhookType = "sub";
    if (this.query.subsChzzkChanIds.includes(live.channelId)) {
      type = "main";
    }
    if (this.query.allowedChzzkChanNames.includes(live.channelName)) {
      type = "main";
    }
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = "extra";
    }

    if (type === "main") {
      const candidate = findCandidateAddCnt(whStates, "main");
      if (!candidate) {
        type = "sub";
      } else {
        return candidate;
      }
    }

    if (type === "sub") {
      const candidate = findCandidateAddCnt(whStates, "sub");
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findCandidateAddCnt(whStates, "extra");
  }
}
