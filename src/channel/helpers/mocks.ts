import { ChannelCreation, ChannelPriority } from '../persistence/channel.types.js';

export function mockChannel(
  n: number,
  priority: ChannelPriority = 'must',
  followerCnt: number = 10,
): ChannelCreation {
  return {
    ptype: 'chzzk',
    pid: `chzzk${n}`,
    username: `user${n}`,
    profileImgUrl: 'http://example.com',
    followerCnt,
    description: '',
    priority,
  };
}
