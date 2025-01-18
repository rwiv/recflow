import amqplib, {Channel, Connection} from "amqplib";
import {AmqpConfig} from "../common/configs.js";

export class Amqp {

  constructor(
    private readonly conf: AmqpConfig,
    private conn: Connection | undefined = undefined,
    private ch: Channel | undefined = undefined,
  ) {
  }

  async connect() {
    const {host, port, username, password} = this.conf;
    this.conn = await amqplib.connect(`amqp://${username}:${password}@${host}:${port}`);
    this.ch = await this.createChannel();
  }

  createChannel() {
    if (this.conn === undefined) {
      throw new Error("Connection is not initialized");
    }
    return this.conn.createChannel();
  }

  async assertQueue(queue: string) {
    if (this.ch === undefined) {
      throw new Error("Channel is not initialized");
    }
    return this.ch.assertQueue(queue, {
      exclusive: false,
      durable: false,
      autoDelete: false,
    });
  }

  publish(queue: string, content: object) {
    if (this.ch === undefined) {
      throw new Error("Channel is not initialized");
    }
    return this.ch.sendToQueue(queue, Buffer.from(JSON.stringify(content)));
  }

  close() {
    this.conn?.close();
  }
}
