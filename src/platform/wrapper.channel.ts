import { PlatformType } from './common.js';
import { ChzzkChannelInfoReq } from './chzzk.req.js';
import { SoopChannelInfoReq } from './soop.req.js';

export class ChannelInfo<T> {
  constructor(
    public readonly type: PlatformType,
    public readonly id: string,
    public readonly name: string,
    public readonly content: T,
  ) {}

  static fromChzzk(
    info: ChzzkChannelInfoReq,
  ): ChannelInfo<ChzzkChannelInfoReq> {
    return new ChannelInfo('chzzk', info.channelId, info.channelName, info);
  }

  static fromSoop(info: SoopChannelInfoReq): ChannelInfo<SoopChannelInfoReq> {
    return new ChannelInfo('soop', info.userId, info.userNick, info);
  }
}
