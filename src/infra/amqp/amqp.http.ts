import { AmqpConfig } from '../../common/types.js';

interface QueueState {
  name: string;
  state: string;
}

export class AmqpHttp {
  constructor(private readonly conf: AmqpConfig) {}

  async fetchByPattern(pattern: string) {
    const queues = await this.fetchAllQueues();
    const regex = new RegExp(`^${pattern.replace('.', '\\.')}`);
    return queues.filter((queue) => regex.test(queue.name));
  }

  async fetchAllQueues() {
    const url = `http://${this.conf.host}:${this.conf.httpPort}/api/queues`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${this.conf.username}:${this.conf.password}`).toString('base64')}`,
      },
    });
    return (await res.json()) as QueueState[];
  }
}
