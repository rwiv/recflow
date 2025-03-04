import { Task } from '../spec/task.interface.js';
import { ChannelWriter } from '../../channel/service/channel.writer.js';
import { channelTaskName } from './channel.tasks.constants.js';

export class ChannelRefreshTask implements Task {
  public readonly name: string;

  constructor(private readonly chWriter: ChannelWriter) {
    this.name = channelTaskName.CHANNEL_REFRESH;
  }

  async run(): Promise<void> {
    await this.chWriter.refresh();
  }
}
