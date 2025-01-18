import {ChzzkLiveInfo} from "../../client/types_chzzk.js";
import {ChzzkWebhookMatcher, ChzzkWebhookState, WebhookType} from "../types.js";
import {QueryConfig} from "../../common/query.js";
import {findChzzkCandidate} from "../utils.js";

export class ChzzkWebhookMatcherMode1 implements ChzzkWebhookMatcher {

  match(live: ChzzkLiveInfo, whStates: ChzzkWebhookState[]): ChzzkWebhookState | null {
    // type === "main"
    const candidate = findChzzkCandidate(whStates, "main");
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findChzzkCandidate(whStates, "extra");
  }
}
