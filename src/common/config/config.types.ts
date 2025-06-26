export interface RedisConfig {
  host: string;
  port: number;
  password: string;
  caPath?: string;
}

export interface AmqpConfig {
  host: string;
  port: number;
  httpPort: number;
  username: string;
  password: string;
}

export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  url: string;
}

export interface SQSConfig {
  accessKey: string;
  secretKey: string;
  regionName: string;
  queueUrl: string;
}

export interface StreamqConfig {
  url: string;
  qsize: number;
}

export interface StlinkConfig {
  endpoint: string;
  httpTimeoutMs: number;
}

export interface UntfConfig {
  endpoint: string;
  apiKey: string;
  topic: string;
}
