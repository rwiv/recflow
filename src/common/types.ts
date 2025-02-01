export interface RedisConfig {
  host: string;
  port: number;
  password: string;
}

export interface AmqpConfig {
  host: string;
  port: number;
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
