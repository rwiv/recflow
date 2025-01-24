import fs from 'fs';
import yaml from 'js-yaml';
import { WebhookInfo, WebhookMode } from '../webhook/types.js';

export interface QueryConfig {
  subsChzzkChanIds: string[];
  subsSoopUserIds: string[];

  chzzkMinUserCnt: number;
  chzzkMinFollowerCnt: number;
  soopMinUserCnt: number;
  soopMinFollowerCnt: number;

  chzzkTags: string[];
  chzzkKeywords: string[];
  chzzkWatchPartyNoList: number[];
  soopCateNoList: string[];

  excludedChzzkCates: string[];
  excludedChzzkTags: string[];
  excludedChzzkKeywords: string[];

  allowedSoopUserIds: string[];
  extraSoopUserIds: string[];
  excludedSoopUserIds: string[];

  allowedChzzkChanNames: string[];
  extraChzzkChanNames: string[];
  excludedChzzkChanNames: string[];
  excludedChzzkChanIds: string[];

  webhookMode: WebhookMode;
  webhooks: WebhookInfo[];
}

export function readQueryConfig(filePath: string): QueryConfig {
  const text = fs.readFileSync(filePath, 'utf-8');
  const query = yaml.load(text) as QueryConfig;
  validate(query);
  return query;
}

function validate(query: QueryConfig) {
  if (!query.webhookMode) {
    throw new Error('webhookMode is required');
  }
  if (!query.webhooks || query.webhooks.length === 0) {
    throw new Error('webhooks is required');
  }
  if (query.webhooks.filter((wh) => wh.type === 'main').length === 0) {
    throw new Error('webhooks must have at least one main webhook');
  }
  for (const whName of query.webhooks.map((wh) => wh.name)) {
    if (query.webhooks.filter((wh) => wh.name === whName).length > 1) {
      throw new Error(`webhook name must be unique: ${whName}`);
    }
  }
  for (const wh of query.webhooks) {
    if (['main', 'sub', 'extra'].includes(wh.type) === false) {
      throw new Error(`webhook type must be one of "main", "sub", "extra": ${wh.type}`);
    }
  }
}
