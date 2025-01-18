import {SoopWebhookMatcher, SoopWebhookState} from "../types.js";
import {findSoopCandidate} from "../utils.js";
import {SoopLiveInfo} from "../../client/types_soop.js";

export class SoopWebhookMatcherMode1 implements SoopWebhookMatcher {

  match(live: SoopLiveInfo, whStates: SoopWebhookState[]): SoopWebhookState | null {
    // type === "main"
    const candidate = findSoopCandidate(whStates, "main");
    if (candidate) {
      return candidate;
    }

    // type === "extra"
    return findSoopCandidate(whStates, "extra");
  }
}
