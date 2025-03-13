export interface RedisConfig {
  host: string;
  port: number;
  password: string;
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

export interface AuthedConfig {
  url: string;
  apiKey: string;
}

export interface UntfConfig {
  endpoint: string;
  authKey: string;
  topic: string;
}
