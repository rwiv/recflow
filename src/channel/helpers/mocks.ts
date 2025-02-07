import { ChannelPriority } from '../priority/types.js';
import { ChannelAppend } from '../business/channel.schema.js';

export function mockChannel(
  n: number,
  priorityName: ChannelPriority = 'must',
  followerCnt: number = 10,
): ChannelAppend {
  return {
    platformName: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    priorityName,
    followed: false,
    description: null,
  };
}
