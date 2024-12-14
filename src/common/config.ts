import {readFile} from "node:fs/promises";
import yaml from "js-yaml";

export interface QueryConfig {
  subscribeChannelIds: string[];
  subscribeUserIds: string[];

  minUserCnt: number;
  minFollowerCnt: number;

  tags: string[];
  keywords: string[];
  soopCategories: string[];

  sufficientTags: string[];

  ignoredCategories: string[];
  ignoredTags: string[];
  ignoredKeywords: string[];

  whiteListChannels: string[];
  ignoredChannels: string[];
}

export async function readQueryConfig(filePath: string): Promise<QueryConfig> {
  const text = await readFile(filePath, "utf-8");
  return yaml.load(text) as QueryConfig;
}
