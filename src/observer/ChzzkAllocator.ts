import {Stdl} from "../client/Stdl.js";
import {Authed} from "../client/Authed.js";
import {Notifier} from "../client/Notifier.js";
import {ChzzkTargetRepository} from "../repository/types.js";
import {ChzzkWebhookMatcher} from "../webhook/types.js";
import {log} from "jslog";
import {ChzzkLiveInfo} from "../client/types_chzzk.js";

export class ChzzkAllocator {

  constructor(
    private readonly stdl: Stdl,
    private readonly authClient: Authed,
    private readonly notifier: Notifier,
    private readonly nftyTopic: string,
    private readonly targets: ChzzkTargetRepository,
    private readonly matcher: ChzzkWebhookMatcher,
  ) {}

  async allocate(live: ChzzkLiveInfo) {
    const wh = this.matcher.match(live, await this.targets.whStates());
    if (!wh) {
      // TODO: use ntfy
      log.warn("No webhook");
      return;
    }
    const ls = await this.targets.set(live.channelId, live, wh);

    // stdl
    let cookies = undefined;
    if (live.adult) {
      cookies = await this.authClient.requestChzzkCookies();
    }
    await this.stdl.requestChzzkLive(wh.url, live.channelId, true, cookies);

    // ntfy
    await this.notifier.sendLiveInfo(this.nftyTopic, live.channelName, live.concurrentUserCount, live.liveTitle);
    return ls;
  }

  async deallocate(live: ChzzkLiveInfo) {
    const ls = await this.targets.delete(live.channelId);
    log.info(`Delete: ${live.channelName}`)
    return ls;
  }
}
