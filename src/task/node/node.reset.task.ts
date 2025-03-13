import { Task } from '../spec/task.interface.js';
import { nodeTaskName } from './node.tasks.constants.js';
import { NodeWriter } from '../../node/service/node.writer.js';

export class NodeResetTask implements Task {
  public readonly name: string;

  constructor(private readonly nodeWriter: NodeWriter) {
    this.name = nodeTaskName.NODE_RESET;
  }

  async run(): Promise<void> {
    await this.nodeWriter.resetFailureCntAll();
  }
}
