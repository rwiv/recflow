import { LiveDto } from '@/live/spec/live.dto.schema.js';

export abstract class Notifier {
  abstract notify(message: string): void;

  sendLiveInfo(liveDto: LiveDto) {
    this.notify(`${liveDto.channel.username} (${liveDto.viewCnt}): ${liveDto.liveTitle}`);
  }
}
