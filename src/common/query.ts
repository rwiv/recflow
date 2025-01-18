import {readFile} from "node:fs/promises";
import yaml from "js-yaml";

export interface QueryConfig {
  subsChzzkChanIds: string[];
  subsSoopUserIds: string[];

  chzzkMinUserCnt: number;
  chzzkMinFollowerCnt: number;
  soopMinUserCnt: number;
  soopMinFollowerCnt: number;

  chzzkTags: string[];
  chzzkKeywords: string[];
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
}

export async function readQueryConfig(filePath: string): Promise<QueryConfig> {
  const text = await readFile(filePath, "utf-8");
  return yaml.load(text) as QueryConfig;
}
