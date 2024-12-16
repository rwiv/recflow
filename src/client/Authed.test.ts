import {it} from "vitest";
import {readEnv} from "../common/env.js";
import {AuthedImpl} from "./Authed.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });

it("test", async () => {
  const {authedUrl, authedEncKey} = readEnv();
  const client = new AuthedImpl(authedUrl, authedEncKey);

  const cookies = await client.requestChzzkCookies();
  console.log(JSON.stringify(cookies));

  const soopCred = await client.requestSoopCred();
  console.log(soopCred);
});
