import {it} from "vitest";
import {readEnv} from "../common/env.js";
import {AuthedImpl} from "./Authed.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });

it("test", async () => {
  const {authUrl} = readEnv();
  const client = new AuthedImpl(authUrl);
  const cookies = await client.requestChzzkCookies();
  console.log(cookies);
});
