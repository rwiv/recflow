import {it} from "vitest";
import {Streamq} from "./Streamq.js";
import {readEnv} from "../common/env.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });
const {streamqUrl, querySize} = readEnv();
const streamq = new Streamq(streamqUrl, querySize);

it("test chzzk", async () => {
  const channelId = "";
  const res2 = await streamq.getChzzkChannel(channelId, false);
  console.log(res2);
});

it("test soop channel", async () => {
  const userId = "";
  const hasLiveInfo = true;
  const res = await streamq.getSoopChannel(userId, hasLiveInfo);
  console.log(res);
});
