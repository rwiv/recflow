import {
  DeleteMessageBatchCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient as AwsSQSClient,
} from '@aws-sdk/client-sqs';
import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { z } from 'zod';
import { DeleteMessageBatchRequestEntry } from '@aws-sdk/client-sqs/dist-types/models/models_0.js';
import { SQSClient } from './sqs.client.js';

const sqsMessage = z.object({
  id: z.string().nonempty(),
  body: z.string().nonempty(),
  handle: z.string().nonempty(),
});
export type SQSMessage = z.infer<typeof sqsMessage>;

@Injectable()
export class SQSClientImpl implements SQSClient {
  private readonly sqs: AwsSQSClient;
  private readonly queueUrl: string;

  constructor(@Inject(ENV) env: Env) {
    this.sqs = new AwsSQSClient({
      region: env.sqs.regionName,
      credentials: {
        accessKeyId: env.sqs.accessKey,
        secretAccessKey: env.sqs.secretKey,
      },
    });
    this.queueUrl = env.sqs.queueUrl;
  }

  async send(msg: string) {
    const command = new SendMessageCommand({ QueueUrl: this.queueUrl, MessageBody: msg });
    await this.sqs.send(command);
  }

  async receive(): Promise<SQSMessage[]> {
    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      WaitTimeSeconds: 20,
      MaxNumberOfMessages: 10,
    });
    const res = await this.sqs.send(command);
    const result: SQSMessage[] = [];
    for (const message of res.Messages ?? []) {
      const id = message.MessageId;
      const body = message.Body;
      const handle = message.ReceiptHandle;
      if (!id || !body || !handle) {
        throw new Error(`Received message with missing fields: ${JSON.stringify(message)}`);
      }
      result.push(sqsMessage.parse({ id, body, handle }));
    }
    return result;
  }

  async delete(messages: SQSMessage[]) {
    if (messages.length === 0) {
      return;
    }

    if (messages.length === 1) {
      const command = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: messages[0].handle,
      });
      await this.sqs.send(command);
    } else {
      const entiries: DeleteMessageBatchRequestEntry[] = [];
      for (const message of messages) {
        entiries.push({ Id: message.id, ReceiptHandle: message.handle });
      }
      const command = new DeleteMessageBatchCommand({ QueueUrl: this.queueUrl, Entries: entiries });
      await this.sqs.send(command);
    }
  }
}
