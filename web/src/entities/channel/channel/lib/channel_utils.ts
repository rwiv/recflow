import { PlatformName } from '@/entities/platform/api/platform.schema.ts';

export function getChannelUrl(type: PlatformName, channelId: string) {
  switch (type) {
    case 'chzzk':
      return `https://chzzk.naver.com/${channelId}`;
    case 'soop':
      return `https://ch.sooplive.co.kr/${channelId}`;
    case 'twitch':
      return `https://www.twitch.tv/${channelId}`;
    default:
      throw new Error(`Not supported channel type: ${type}`);
  }
}
