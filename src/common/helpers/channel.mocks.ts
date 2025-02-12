import { ChannelAppend, channelAppend } from '../../channel/spec/channel.dto.schema.js';

export function mockChannel(
  n: number,
  priorityName: string = 'must',
  followerCnt: number = 10,
): ChannelAppend {
  const append: ChannelAppend = {
    platformName: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priorityName,
    followed: false,
    description: null,
  };
  return channelAppend.parse(append);
}
