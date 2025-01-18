import {Stdl} from "../client/Stdl.js";
import {Authed} from "../client/Authed.js";
import {Notifier} from "../client/Notifier.js";
import {SoopTargetRepository} from "../repository/types.js";
import {SoopWebhookMatcher} from "../webhook/types.js";
import {log} from "jslog";
import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export class SoopAllocator {

  constructor(
    private readonly stdl: Stdl,
    private readonly authClient: Authed,
    private readonly notifier: Notifier,
    private readonly nftyTopic: string,
    private readonly targets: SoopTargetRepository,
    private readonly matcher: SoopWebhookMatcher,
  ) {}

  async allocate(live: SoopLiveInfo) {
    const wh = this.matcher.match(live, await this.targets.whStates());
    if (!wh) {
      // TODO: use ntfy
      log.warn("No webhook");
      return;
    }
    await this.targets.set(live.userId, live, wh);

    // stdl
    let cred = undefined;
    if (live.adult) {
      cred = await this.authClient.requestSoopCred();
    }
    await this.stdl.requestSoopLive(wh.url, live.userId, true, cred);

    // ntfy
    await this.notifier.sendLiveInfo(this.nftyTopic, live.userNick, parseInt(live.totalViewCnt), live.broadTitle);
  }

  async deallocate(live: ChzzkLiveInfo) {
    await this.targets.delete(live.channelId);
    log.info(`Delete: ${live.channelName}`)
  }
}
