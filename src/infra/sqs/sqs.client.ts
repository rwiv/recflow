export interface SQSClient {
  send(msg: string): Promise<void>;
}
