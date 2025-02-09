import fs from 'fs';
import yaml from 'js-yaml';
import { ChannelPriorityConfig } from './config.types.js';

export interface QueryConfig {
  options: PlatformOptions;

  priority: ChannelPriorityConfig;

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
}

export interface PlatformOptions {
  chzzk: QueryOption;
  soop: QueryOption;
}

export interface QueryOption {
  forceCredentials: boolean;
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
}

function validateQueryOptions(opts: QueryOption) {
  // forceCredentials
  if (opts.forceCredentials === undefined) {
    throw new Error('forceCredentials is required');
  }
}
