import {it} from "vitest";
import {readEnv} from "../common/env.js";
import {AuthClientImpl} from "./AuthClient.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });

it("test", async () => {
  const {authUrl} = readEnv();
  const client = new AuthClientImpl(authUrl);
  const cookies = await client.requestChzzkCookies();
  console.log(cookies);
});
