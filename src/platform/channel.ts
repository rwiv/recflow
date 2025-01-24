import { PlatformType } from './types.js';
import { ChzzkChannelInfo } from './chzzk.js';
import { SoopChannelInfo } from './soop.js';

export class ChannelInfo<T> {
  constructor(
    public readonly type: PlatformType,
    public readonly id: string,
    public readonly name: string,
    public readonly followerCount: number,
    public readonly openLive: boolean,
    public readonly content: T,
  ) {}

  static fromChzzk(info: ChzzkChannelInfo): ChannelInfo<ChzzkChannelInfo> {
    return new ChannelInfo(
      'chzzk',
      info.channelId,
      info.channelName,
      info.followerCount,
      info.openLive,
      info,
    );
  }

  static fromSoop(info: SoopChannelInfo): ChannelInfo<SoopChannelInfo> {
    return new ChannelInfo('soop', info.userId, info.userNick, info.fanCnt, info.openLive, info);
  }
}
