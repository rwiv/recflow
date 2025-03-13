import { LiveDto } from '../../live/spec/live.dto.schema.js';

export abstract class Notifier {
  abstract notify(topic: string, message: string): void;

  sendLiveInfo(topic: string, liveDto: LiveDto) {
    const notifyMsg = `${liveDto.channel.username} (${liveDto.viewCnt}): ${liveDto.liveTitle}`;
    this.notify(topic, notifyMsg);
  }
}
