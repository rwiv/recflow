import { vi } from 'vitest';

import { SQSClient } from '@/external/sqs/sqs.client.js';

export class SQSClientMock extends SQSClient {
  send = vi.fn();
}
