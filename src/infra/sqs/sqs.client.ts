export abstract class SQSClient {
  abstract send(msg: string): Promise<void>;
}
