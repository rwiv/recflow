import {it} from "vitest";
import {Streamq} from "../client/Streamq.js";
import {readEnv} from "../common/env.js";
import {readQueryConfig} from "../common/query";
import dotenv from "dotenv";
import {SoopLiveFilter} from "./SoopLiveFilter.js";

dotenv.config({ path: "dev/.env" });

it("test filtered", async () => {
  const {configPath, streamqUrl} = readEnv();
  const query = await readQueryConfig(configPath);
  const streamq = new Streamq(streamqUrl);
  const filter = new SoopLiveFilter(streamq);

  const infos = await streamq.getSoopLive(query);
  const filtered = await filter.getFiltered(infos, query);

  for (const info of filtered) {
    const url = `https://play.sooplive.co.kr/${info.userId}`;
    console.log(`${url} - ${info.userNick} (${info.totalViewCnt}): ${info.broadTitle}`);
  }
});
