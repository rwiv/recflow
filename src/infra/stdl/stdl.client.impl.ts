import { Inject, Injectable } from '@nestjs/common';
import { RecorderStatus, nodeStatusResponse, Stdl } from './stdl.client.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { log } from 'jslog';

@Injectable()
export class StdlImpl extends Stdl {
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async getStatus(endpoint: string): Promise<RecorderStatus[]> {
    const res = await fetch(`${endpoint}`, { signal: AbortSignal.timeout(this.env.httpTimeout) });
    return nodeStatusResponse.parse(await res.json()).recorders;
  }

  async startRecording(endpoint: string, recordId: string): Promise<void> {
    const res = await fetch(`${endpoint}/${recordId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(this.env.httpTimeout),
    });
    if (res.status >= 400) {
      log.error(`Failed to start recording`, { status: res.status, body: await res.text() });
      throw new HttpRequestError(`Failed to start recording`, res.status);
    }
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    const res = await fetch(`${endpoint}/${recordId}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      signal: AbortSignal.timeout(this.env.httpTimeout),
    });
    if (res.status >= 400) {
      throw new HttpRequestError(`Error requesting recording`, res.status);
    }
  }
}
