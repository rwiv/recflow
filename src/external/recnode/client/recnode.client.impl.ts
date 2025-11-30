import { Inject, Injectable } from '@nestjs/common';

import { checkResponse, getHttpRequestError } from '@/utils/http.js';

import { ENV } from '@/common/config/config.module.js';
import { Env } from '@/common/config/env.js';

import { Recnode, RecordingStatus, nodeStatusResponse } from '@/external/recnode/client/recnode.client.js';

@Injectable()
export class RecnodeImpl extends Recnode {
  constructor(@Inject(ENV) private readonly env: Env) {
    super();
  }

  async getStatus(endpoint: string): Promise<RecordingStatus[]> {
    const url = this.getRecordingsUrl(endpoint);
    const attr = { url };
    const failureMsg = 'Failed to get recording status';
    try {
      const res = await fetch(url, this.getRequest('GET'));
      await checkResponse(res, attr, failureMsg);
      return nodeStatusResponse.parse(await res.json()).recordings;
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  async getStatusWithStats(endpoint: string): Promise<RecordingStatus[]> {
    const url = `${this.getRecordingsUrl(endpoint)}?fields=stats`;
    const attr = { url };
    const failureMsg = 'Failed to get recording status with stats';
    try {
      const res = await fetch(url, this.getRequest('GET'));
      await checkResponse(res, attr, failureMsg);
      return nodeStatusResponse.parse(await res.json()).recordings;
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  async startRecording(endpoint: string, liveRecordId: string): Promise<void> {
    const url = `${this.getRecordingsUrl(endpoint)}/${liveRecordId}`;
    const attr = { url, live_record_id: liveRecordId };
    const failureMsg = 'Failed to start recording';
    try {
      const res = await fetch(url, this.getRequest('POST'));
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
      const res = await fetch(url, this.getRequest('DELETE'));
      await checkResponse(res, attr, failureMsg);
    } catch (err) {
      throw getHttpRequestError(failureMsg, err, attr);
    }
  }

  private getRecordingsUrl(endpoint: string) {
    return `${endpoint}/api/recordings`;
  }

  private getRequest(method: string): RequestInit {
    return {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.env.recnodeApiToken}`,
      },
      signal: AbortSignal.timeout(this.env.httpTimeout),
    };
  }
}
