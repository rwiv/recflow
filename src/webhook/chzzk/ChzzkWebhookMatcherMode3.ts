import {ChzzkLiveInfo} from "../../client/types_chzzk.js";
import {ChzzkWebhookMatcher, ChzzkWebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findChzzkCandidate} from "../utils.js";

export class ChzzkWebhookMatcherMode3 implements ChzzkWebhookMatcher {

  constructor(private readonly query: QueryConfig) {}

  match(live: ChzzkLiveInfo, whStates: ChzzkWebhookState[]): ChzzkWebhookState | null {
    let type: WebhookType = "main";
    if (this.query.extraChzzkChanNames.includes(live.channelName)) {
      type = "extra";
    }

    if (type === "main") {
      const candidate = findChzzkCandidate(whStates, "main");
      if (!candidate) {
        type = "sub";
      } else {
        return candidate;
      }
    }

    if (type === "sub") {
      const candidate = findChzzkCandidate(whStates, "sub");
      if (candidate) {
        return candidate;
      }
    }

    // type === "extra"
    return findChzzkCandidate(whStates, "extra");
  }
}
