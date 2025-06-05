import { Injectable } from '@nestjs/common';
import { log } from 'jslog';
import { StdlDoneMessage, Vtask } from './types.js';

@Injectable()
export class VtaskMock implements Vtask {
  addTask(doneMessage: StdlDoneMessage): Promise<void> {
    log.info(`MockVtask.addTask(...)`, { done_message: doneMessage });
    return Promise.resolve(undefined);
  }
}
