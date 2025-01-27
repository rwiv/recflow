import { log } from 'jslog';

export abstract class Notifier {
  abstract notify(topic: string, message: string): Promise<void>;

  async sendLiveInfo(topic: string, channelName: string, userCnt: number, title: string) {
    const msg = { channelName, userCnt, title };
    log.info('New Live', msg);
    const notifyMsg = `${msg.channelName} (${msg.userCnt}): ${msg.title}`;
    await this.notify(topic, notifyMsg);
  }
}
