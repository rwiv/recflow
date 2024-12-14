import {it, expect} from "vitest";
import {readEnv} from "./env.js";
import dotenv from "dotenv";

dotenv.config({ path: "dev/.env" });

it("test", () => {
  const env = readEnv();
  // expect(env.ntfyEndpoint).eq(undefined)
  expect(env.nodeEnv).eq("dev")
});
