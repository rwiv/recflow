import { readEnv } from '../config/env.js';
import { readQueryConfig } from '../config/query.js';
import fs from 'fs';
import path from 'path';

const env = readEnv();
const query = readQueryConfig(env.configPath);

export function getConf() {
  return [env, query] as const;
}

export function readTestConfSync() {
  const p = path.join('dev', 'test_conf.json');
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as TestConfig;
}

export async function readTestConf() {
  const p = path.join('dev', 'test_conf.json');
  return JSON.parse(await fs.promises.readFile(p, 'utf-8')) as TestConfig;
}

export interface TestConfig {
  pid: string;
  pids: string[];
  endpoint: string;
}
