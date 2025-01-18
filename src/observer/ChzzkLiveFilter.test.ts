import {it} from "vitest";
import {Streamq} from "../client/Streamq.js";
import {readEnv} from "../common/env.js";
import {readQueryConfig} from "../common/query";
import dotenv from "dotenv";
import {ChzzkLiveFilter} from "./ChzzkLiveFilter.js";

dotenv.config({ path: "dev/.env" });

it("test filtered", async () => {
  const {configPath, streamqUrl} = readEnv();
  const query = await readQueryConfig(configPath);
  const streamq = new Streamq(streamqUrl);
  const filter = new ChzzkLiveFilter(streamq);

  const infos = await streamq.getChzzkLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://chzzk.naver.com/live/${info.channelId}`;
    console.log(`${url} - ${info.channelName} (${info.concurrentUserCount}): ${info.liveTitle}`);
  }
});
