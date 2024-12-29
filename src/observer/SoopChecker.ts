import {QueryConfig} from "../common/config.js";
import {Streamq} from "../client/Streamq.js";
import {Stdl} from "../client/Stdl.js";
import {Authed} from "../client/Authed.js";
import {Notifier} from "../client/Notifier.js";
import {SoopTargetRepository} from "../repository/types.js";
import {log} from "jslog";
import {SoopLiveFilter} from "./SoopLiveFilter.js";
import {SoopLiveInfo} from "../client/types_soop.js";

export class SoopChecker {

  private isChecking: boolean = false;
  private filter: SoopLiveFilter;

  constructor(
    private readonly query: QueryConfig,
    private readonly streamq: Streamq,
    private readonly stdl: Stdl,
    private readonly authClient: Authed,
    private readonly notifier: Notifier,
    private readonly targets: SoopTargetRepository,
    private readonly nftyTopic: string,
  ) {
    this.filter = new SoopLiveFilter(streamq);
  }

  async check() {
    if (this.isChecking) {
      log.info("Already checking");
      return;
    }
    this.isChecking = true;

    // --------------- check by subscriptions -------------------------------
    const filteredChannels = (await Promise.all(
      this.query.subsSoopUserIds
        .filter(userId => !this.targets.get(userId))
        .map(userId => this.streamq.getSoopChannel(userId, false))
    ))
      .filter(info => info !== null)
      .filter(info => info.openLive);
    for (const channel of filteredChannels) {
      if (!this.targets.get(channel.userId)) {
        await this.addInfo(channel.userId);
      }
    }

    // --------------- check by query --------------------------------------
    const queriedInfos = await this.streamq.getSoopLive(this.query);
    const filtered = await this.filter.getFiltered(queriedInfos, this.query);

    // add new LiveInfos
    const toBeAddedInfos: SoopLiveInfo[] = (await Promise.all(
      filtered.map(async info => this.isToBeAdded(info))
    )).filter(info => info !== null)

    for (const newInfo of toBeAddedInfos) {
      await this.addInfo(newInfo.userId);
    }

    // delete LiveInfos
    const toBeDeletedInfos: SoopLiveInfo[] = (await Promise.all(
      this.targets.values().map(async info => this.isToBeDeleted(info))
    )).filter(info => info !== null)

    for (const toBeDeleted of toBeDeletedInfos) {
      this.targets.delete(toBeDeleted.userId);
      log.info(`Delete: ${toBeDeleted.userNick}`)
    }

    this.isChecking = false;
  }

  private async addInfo(channelId: string) {
    const channel = await this.streamq.getSoopChannel(channelId, true);
    if (!channel) {
      throw Error("Not found channel");
    }
    const live = channel.liveInfo;
    if (!live) {
      throw Error("No liveInfo");
    }
    this.targets.set(channel.userId, live);
    let cred = undefined;
    if (live.adult) {
      cred = await this.authClient.requestSoopCred();
    }
    await this.stdl.requestSoopLive(channel.userId, true, cred);
    await this.notifier.sendLiveInfo(this.nftyTopic, live.userNick, parseInt(live.totalViewCnt), live.broadTitle);
  }

  private async isToBeAdded(newInfo: SoopLiveInfo) {
    if (this.targets.get(newInfo.userId)) {
      return null;
    }
    // 스트리머가 방송을 종료해도 query 결과에는 나올 수 있음
    // 이렇게되면 리스트에서 삭제되자마자 다시 리스트에 포함되어 스트리머가 방송을 안함에도 불구하고 리스트에 포함되는 문제가 생길 수 있음
    // 따라서 queried LiveInfo 뿐만 아니라 ChannelInfo를 같이 확인하여 방송중인지 확인한 뒤 리스트에 추가한다
    const channel = await this.streamq.getSoopChannel(newInfo.userId, false);
    if (!channel?.openLive) {
      return null;
    }
    return newInfo;
  }

  private async isToBeDeleted(existingInfo: SoopLiveInfo) {
    const channel = await this.streamq.getSoopChannel(existingInfo.userId, false);
    if (channel?.openLive) {
      return null;
    }
    return existingInfo;
  }
}
