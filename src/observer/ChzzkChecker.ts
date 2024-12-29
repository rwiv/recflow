import {log} from "jslog";
import {ChzzkLiveInfo} from "../client/types_chzzk.js";
import {Notifier} from "../client/Notifier.js";
import {Streamq} from "../client/Streamq.js";
import {ChzzkTargetRepository} from "../repository/types.js";
import {Stdl} from "../client/Stdl.js";
import {Authed} from "../client/Authed.js";
import {QueryConfig} from "../common/config.js";
import {ChzzkLiveFilter} from "./ChzzkLiveFilter.js";

export class ChzzkChecker {

  private isChecking: boolean = false;
  private filter: ChzzkLiveFilter;

  constructor(
    private readonly query: QueryConfig,
    private readonly streamq: Streamq,
    private readonly stdl: Stdl,
    private readonly authClient: Authed,
    private readonly notifier: Notifier,
    private readonly targets: ChzzkTargetRepository,
    private readonly nftyTopic: string,
  ) {
    this.filter = new ChzzkLiveFilter(streamq);
  }

  async check() {
    if (this.isChecking) {
      log.info("Already checking");
      return;
    }
    this.isChecking = true;

    // --------------- check by subscriptions -------------------------------
    const filteredChannels = (await Promise.all(
      this.query.subsChzzkChanIds
        .filter(channelId => !this.targets.get(channelId))
        .map(channelId => this.streamq.getChzzkChannel(channelId, false))
    )).filter(info => info.openLive);
    for (const channel of filteredChannels) {
      if (!this.targets.get(channel.channelId)) {
        await this.addInfo(channel.channelId);
      }
    }

    // --------------- check by query --------------------------------------
    const queriedInfos = await this.streamq.getChzzkLive(this.query);
    const filtered = await this.filter.getFiltered(queriedInfos, this.query);

    // add new LiveInfos
    const toBeAddedInfos: ChzzkLiveInfo[] = (await Promise.all(
      filtered.map(async info => this.isToBeAdded(info))
    )).filter(info => info !== null)

    for (const newInfo of toBeAddedInfos) {
      await this.addInfo(newInfo.channelId);
    }

    // delete LiveInfos
    const toBeDeletedInfos: ChzzkLiveInfo[] = (await Promise.all(
      this.targets.values().map(async info => this.isToBeDeleted(info))
    )).filter(info => info !== null)

    for (const toBeDeleted of toBeDeletedInfos) {
      this.targets.delete(toBeDeleted.channelId);
      log.info(`Delete: ${toBeDeleted.channelName}`)
    }

    this.isChecking = false;
  }

  private async addInfo(channelId: string) {
    const channel = await this.streamq.getChzzkChannel(channelId, true);
    const live = channel.liveInfo;
    if (!live) {
      throw Error("No liveInfo");
    }
    this.targets.set(channel.channelId, live);
    let cookies = undefined;
    if (live.adult) {
      cookies = await this.authClient.requestChzzkCookies();
    }
    await this.stdl.requestChzzkLive(channel.channelId, true, cookies);
    await this.notifier.sendLiveInfo(this.nftyTopic, live.channelName, live.concurrentUserCount, live.liveTitle);
  }

  private async isToBeAdded(newInfo: ChzzkLiveInfo) {
    if (this.targets.get(newInfo.channelId)) {
      return null;
    }
    // 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const {openLive} = await this.streamq.getChzzkChannel(newInfo.channelId, false);
    if (!openLive) {
      return null;
    }
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: ChzzkLiveInfo) {
    const {openLive} = await this.streamq.getChzzkChannel(existingInfo.channelId, false);
    if (openLive) {
      return null;
    }
    return existingInfo;
  }
}
