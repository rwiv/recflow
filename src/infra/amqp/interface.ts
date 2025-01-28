import amqplib, { Channel } from 'amqplib';

export interface Amqp {
  init(): Promise<void>;
  createChannel(): Promise<Channel>;
  checkQueue(queue: string): Promise<boolean>;
  assertQueue(queue: string): Promise<amqplib.Replies.AssertQueue>;
  publish(queue: string, content: object): boolean;
  close(): Promise<void>;
}
