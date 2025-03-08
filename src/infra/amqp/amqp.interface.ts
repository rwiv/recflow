import amqplib, { Channel } from 'amqplib';
import { QueueState } from './amqp.schema.js';

export interface Amqp {
  init(): Promise<void>;
  createChannel(): Promise<Channel>;
  checkQueue(queue: string): Promise<boolean>;
  assertQueue(queue: string): Promise<amqplib.Replies.AssertQueue>;
  publish(queue: string, content: object): boolean;
  close(): Promise<void>;
}

export interface AmqpHttp {
  fetchByPattern(pattern: string): Promise<QueueState[]>;
  fetchAllQueues(): Promise<QueueState[]>;
}
