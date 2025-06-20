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

export interface StreamqConfig {
  url: string;
  qsize: number;
}

export interface StlinkConfig {
  endpoint: string;
}

export interface UntfConfig {
  endpoint: string;
  apiKey: string;
  topic: string;
}

export interface VtaskConfig {
  endpoint: string;
}
