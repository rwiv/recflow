import {log} from "jslog";
import {LiveInfo} from "../client/types.js";
import {Notifier} from "../client/Notifier.js";
import {StreamqClient} from "../client/StreamqClient.js";
import {TargetRepository} from "../repository/types.js";
import {StdlClient} from "../client/StdlClient.js";
import {AuthClient} from "../client/AuthClient.js";
import {QueryConfig} from "../common/config.js";
import {LiveInfoFilter} from "./LiveInfoFilter.js";

export class ChzzkChecker {

  private isChecking: boolean = false;
  private filter: LiveInfoFilter;

  constructor(
    private readonly query: QueryConfig,
    private readonly streamq: StreamqClient,
    private readonly stdl: StdlClient,
    private readonly authClient: AuthClient,
    private readonly notifier: Notifier,
    private readonly targetRepository: TargetRepository,
    private readonly nftyTopic: string,
  ) {
    this.filter = new LiveInfoFilter(streamq);
  }

  async check() {
    if (this.isChecking) {
      log.info("Already checking");
      return;
    }
    this.isChecking = true;

    // ---------------------------------------------------
    // check by subscribe channels
    const filteredChannels = (await Promise.all(
      this.query.subscribeChannelIds
        .filter(channelId => !this.targetRepository.get(channelId))
        .map(channelId => this.streamq.requestChzzkChannel(channelId, false))
    )).filter(info => info.openLive);
    for (const channel of filteredChannels) {
      if (!this.targetRepository.get(channel.channelId)) {
        await this.addInfo(channel.channelId);
      }
    }

    // ---------------------------------------------------
    // check by query
    const queriedInfos = await this.streamq.requestChzzkByQuery(this.query);
    const filtered = await this.filter.getFiltered(queriedInfos, this.query);

    // Add new LiveInfos
    const toBeAddedInfos: LiveInfo[] = (await Promise.all(
      filtered.map(async info => this.isToBeAdded(info))
    )).filter(info => info !== null)

    for (const newInfo of toBeAddedInfos) {
      await this.addInfo(newInfo.channelId);
    }

    // Delete LiveInfos
    const toBeDeletedInfos: LiveInfo[] = (await Promise.all(
      this.targetRepository.values().map(async info => this.isToBeDeleted(info))
    )).filter(info => info !== null)

    for (const toBeDeleted of toBeDeletedInfos) {
      this.targetRepository.delete(toBeDeleted.channelId);
      log.info(`Delete: ${toBeDeleted.channelName}`)
    }

    this.isChecking = false;
  }

  private async addInfo(channelId: string) {
    const info = await this.streamq.requestChzzkChannel(channelId, true);
    const liveInfo = info.liveInfo;
    if (!liveInfo) {
      throw Error("No liveInfo");
    }
    this.targetRepository.set(info.channelId, liveInfo);
    let cookies = undefined;
    if (liveInfo.adult) {
      cookies = await this.authClient.requestChzzkCookies();
    }
    await this.stdl.requestChzzkLive(info.channelId, true, cookies);
    await this.notifier.sendLiveInfo(this.nftyTopic, liveInfo.channelName, liveInfo.concurrentUserCount, liveInfo.liveTitle);
  }

  private async isToBeAdded(newInfo: LiveInfo) {
    if (this.targetRepository.get(newInfo.channelId)) {
      return null;
    }
    // chzzk 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const {openLive} = await this.streamq.requestChzzkChannel(newInfo.channelId, false);
    if (!openLive) {
      return null;
    }
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: LiveInfo) {
    const {openLive} = await this.streamq.requestChzzkChannel(existingInfo.channelId, false);
    if (openLive) {
      return null;
    }
    return existingInfo;
  }
}
