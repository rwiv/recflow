import { SQSClient } from './sqs.client.js';
import { vi } from 'vitest';

export class SQSClientFake extends SQSClient {
  send = vi.fn();
}
