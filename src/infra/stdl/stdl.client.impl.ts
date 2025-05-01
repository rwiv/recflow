import { Injectable } from '@nestjs/common';
import { NodeRecorderStatus, nodeStatusResponse, Stdl } from './stdl.client.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';

@Injectable()
export class StdlImpl implements Stdl {
  async getStatus(endpoint: string): Promise<NodeRecorderStatus[]> {
    const res = await fetch(`${endpoint}`);
    return nodeStatusResponse.parse(await res.json()).recorders;
  }

  async startRecording(endpoint: string, recordId: string): Promise<void> {
    const res = await fetch(`${endpoint}/${recordId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    });
    if (res.status >= 400) {
      throw new HttpRequestError(`Error requesting recording`, res.status);
    }
  }

  async cancelRecording(endpoint: string, recordId: string): Promise<void> {
    const res = await fetch(`${endpoint}/${recordId}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
    });
    if (res.status >= 400) {
      throw new HttpRequestError(`Error requesting recording`, res.status);
    }
  }
}
