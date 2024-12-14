import {it} from "vitest";
import {StreamqClient} from "../client/StreamqClient.js";
import {readEnv} from "../common/env.js";
import {readQueryConfig} from "../common/config.js";
import dotenv from "dotenv";
import {LiveInfoFilter} from "./LiveInfoFilter.js";

dotenv.config({ path: "dev/.env" });

it("test filtered", async () => {
  const {configPath, streamqUrl} = readEnv();
  const query = await readQueryConfig(configPath);
  const streamq = new StreamqClient(streamqUrl);
  const filter = new LiveInfoFilter(streamq);

  const infos = await streamq.requestChzzkByQuery(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://chzzk.naver.com/live/${info.channelId}`;
    console.log(`${url} - ${info.channelName} (${info.concurrentUserCount}): ${info.liveTitle}`);
  }
});
