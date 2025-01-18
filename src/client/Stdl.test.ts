import {it} from "vitest";
import {StdlImpl} from "./Stdl.js";
import {readEnv} from "../common/env.js";
import dotenv from "dotenv";
import {AuthedImpl} from "./Authed.js";

dotenv.config({ path: "dev/.env" });

it("test", async () => {
  const {stdlUrl, authedUrl, authedEncKey} = readEnv();
  const stdl = new StdlImpl();
  const authClient = new AuthedImpl(authedUrl, authedEncKey);

  const uid = "";
  const cookies = await authClient.requestChzzkCookies();
  // const cookies = undefined;
  await stdl.requestChzzkLive(stdlUrl, uid, true, cookies);
});
