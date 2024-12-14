import {it} from "vitest";
import {StdlClientImpl} from "./StdlClient.js";
import {readEnv} from "../common/env.js";
import dotenv from "dotenv";
import {AuthClientImpl} from "./AuthClient.js";

dotenv.config({ path: "dev/.env" });

it("test", async () => {
  const {stdlUrl, authUrl} = readEnv();
  const stdl = new StdlClientImpl(stdlUrl);
  const authClient = new AuthClientImpl(authUrl);

  const uid = "";
  const cookies = await authClient.requestChzzkCookies();
  // const cookies = undefined;
  await stdl.requestChzzkLive(uid, true, cookies);
});
