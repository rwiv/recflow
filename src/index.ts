import {log} from "jslog";
import {AppRunner} from "./server/server.js";
import {readQueryConfig} from "./common/query.js";
import {readEnv} from "./common/env.js";

async function main() {
  const env = readEnv();
  const query = await readQueryConfig(env.configPath);

  log.info("Env", env);
  log.info("Config", query);

  const runner = new AppRunner(env, query);
  return runner.run();
}

main().catch(err => log.error(err));
