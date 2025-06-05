import { Inject, Injectable } from '@nestjs/common';
import { RecordingStatus, nodeStatusResponse, Stdl } from './stdl.client.js';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { checkResponse, getHttpRequestError } from '../../utils/http.js';

@Injectable()
export class StdlImpl extends Stdl {
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async getStatus(endpoint: string): Promise<RecordingStatus[]> {
    const url = this.getRecordingsUrl(endpoint);
    const attr = { url };
    const failureMsg = 'Failed to get recording status';
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(this.env.httpTimeout),
      });
      await checkResponse(res, attr, failureMsg);
      return nodeStatusResponse.parse(await res.json()).recorders;
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  async startRecording(endpoint: string, liveRecordId: string): Promise<void> {
    const url = `${this.getRecordingsUrl(endpoint)}/${liveRecordId}`;
    const attr = { url, live_record_id: liveRecordId };
    const failureMsg = 'Failed to start recording';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(this.env.httpTimeout),
      });
      await checkResponse(res, attr, failureMsg);
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  async cancelRecording(endpoint: string, liveRecordId: string): Promise<void> {
    const url = `${this.getRecordingsUrl(endpoint)}/${liveRecordId}`;
    const attr = { url, live_record_id: liveRecordId };
    const failureMsg = 'Failed to cancel recording';
    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        signal: AbortSignal.timeout(this.env.httpTimeout),
      });
      await checkResponse(res, attr, failureMsg);
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  private getRecordingsUrl(endpoint: string) {
    return `${endpoint}/api/recordings`;
  }
}
