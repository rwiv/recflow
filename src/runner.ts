import {readEnv} from "./common/env.js";
import {Observer} from "./observer/Observer.js";
import {readQueryConfig} from "./common/config.js";
import {log} from "jslog";
import {DepManager} from "./common/DepManager.js";

export async function run() {
  const env = readEnv();
  const query = await readQueryConfig(env.configPath);
  log.info("Env", env);
  // log.info("Config", query);

  // start observing
  const dep = new DepManager(env, query);
  const observer = new Observer(dep.chzzkChecker, dep.soopChecker);
  observer.observe();
}
