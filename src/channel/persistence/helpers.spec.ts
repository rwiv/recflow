import { ChannelCreation, ChannelPriority } from './channel.types.js';

export function mockChannel(
  n: number,
  priority: ChannelPriority = 'must',
  followerCount: number = 10,
): ChannelCreation {
  return {
    ptype: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    description: 'desc',
    followerCnt: followerCount,
    priority,
  };
}
