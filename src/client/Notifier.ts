import {log} from "jslog";

export abstract class Notifier {

  abstract notify(topic: string, message: string): Promise<void>;

  async sendLiveInfo(topic: string, channelName: string, userCnt: number, title: string) {
    const msg = { channelName, userCnt, title };
    log.info("New Live", msg);
    const notifyMsg = `${msg.channelName} (${msg.userCnt}): ${msg.title}`
    await this.notify(topic, notifyMsg);
  }
}

export class NtfyNotifier extends Notifier {

  constructor(
    private readonly ntfyEndpoint: string,
  ) {
    super();
  }

  async notify(topic: string, message: string): Promise<void> {
    const url = `${this.ntfyEndpoint}/${topic}`;
    await fetch(url, {
      method: "POST",
      body: message,
    });
  }
}

export class MockNotifier extends Notifier {
  notify(topic: string, message: string): Promise<void> {
    log.info(`MockNotifier.notify(${topic}, ${message})`);
    return Promise.resolve();
  }
}
