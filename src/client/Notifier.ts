import {log} from "jslog";

export interface Notifier {
  notify(topic: string, message: string): Promise<void>;
}

export class NtfyNotifier implements Notifier {

  constructor(
    private readonly ntfyEndpoint: string,
  ) {}

  async notify(topic: string, message: string): Promise<void> {
    const url = `${this.ntfyEndpoint}/${topic}`;
    await fetch(url, {
      method: "POST",
      body: message,
    });
  }
}

export class MockNotifier implements Notifier {
  notify(topic: string, message: string): Promise<void> {
    log.info(`MockNotifier.notify(${topic}, ${message})`);
    return Promise.resolve();
  }
}
