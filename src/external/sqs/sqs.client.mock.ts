import { SQSClient } from './sqs.client.js';
import { vi } from 'vitest';

export class SQSClientMock extends SQSClient {
  send = vi.fn();
}
