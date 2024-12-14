import {it} from "vitest";
import {StreamqClient} from "./StreamqClient.js";
import {readEnv} from "../common/env.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });


it("test tag", async () => {
  const {streamqUrl} = readEnv();
  const streamq = new StreamqClient(streamqUrl);

  const tag = "watchparty";
  const res = await streamq.requestChzzkByTag(tag);
  console.log(res.map((info) => info.channelName).length);

  const channelId = "";
  const res2 = await streamq.requestChzzkChannel(channelId, false);
  console.log(res2);
});
