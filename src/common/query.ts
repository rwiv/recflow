import fs from 'fs';
import yaml from 'js-yaml';
import { NodeDef, NodeSelectMode, NodePriority } from '../live/node/types.js';

export interface QueryConfig {
  options: PlatformOptions;

  followChzzkChanIds: string[];
  followSoopUserIds: string[];

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

  webhookMode: NodeSelectMode;
  webhooks: NodeDef[];
}

export interface PlatformOptions {
  chzzk: QueryOption;
  soop: QueryOption;
}

export interface QueryOption {
  forceCredentials: boolean;
  forceWebhookType: NodePriority | undefined | null;
}

export function readQueryConfig(filePath: string): QueryConfig {
  const text = fs.readFileSync(filePath, 'utf-8');
  const query = yaml.load(text) as QueryConfig;
  validate(query);
  return query;
}

function validate(query: QueryConfig) {
  validateQueryOptions(query.options.chzzk);
  validateQueryOptions(query.options.soop);
  validateWebhookConfigs(query);
}

function validateQueryOptions(opts: QueryOption) {
  // forceCredentials
  if (opts.forceCredentials === undefined) {
    throw new Error('forceCredentials is required');
  }

  // forceWebhookType
  if (opts.forceWebhookType) {
    checkWebhookType(opts.forceWebhookType);
  }
}

function validateWebhookConfigs(query: QueryConfig) {
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
    checkWebhookType(wh.type);
  }
}

function checkWebhookType(type: string) {
  if (!['main', 'sub', 'extra'].includes(type)) {
    throw new Error(`webhook type must be one of "main", "sub", "extra": ${type}`);
  }
}
