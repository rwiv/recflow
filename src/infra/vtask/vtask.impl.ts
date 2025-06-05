import { Inject, Injectable } from '@nestjs/common';
import { StdlDoneMessage, Vtask } from './types.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { checkResponse, getHttpRequestError } from '../../utils/http.js';

@Injectable()
export class VtaskImpl implements Vtask {
  private readonly endpoint: string;
  constructor(@Inject(ENV) private readonly env: Env) {
    this.endpoint = this.env.vtask.endpoint;
  }

  async addTask(doneMessage: StdlDoneMessage): Promise<void> {
    const url = `${this.endpoint}/api/stdl/tasks`;
    const attr = {
      url,
      cmd: doneMessage.status,
      platform: doneMessage.platform,
      channel_uid: doneMessage.uid,
      video_name: doneMessage.videoName,
    };
    const failureMsg = `Failed to add task`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(this.env.httpTimeout),
        body: JSON.stringify(doneMessage),
      });
      await checkResponse(res, attr, failureMsg);
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }
}
