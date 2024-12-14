import {readEnv} from "./common/env.js";
import {Observer} from "./observer/Observer.js";
import {readQueryConfig} from "./common/config.js";
import {log} from "jslog";
import {ChzzkChecker} from "./observer/ChzzkChecker.js";
import {DepManager} from "./common/DepManager.js";

export async function run() {
  const env = readEnv();
  const query = await readQueryConfig(env.configPath);
  log.info("Env", env);
  // log.info("Config", query);

  const dep = new DepManager(env);

  const chzzkChecker = new ChzzkChecker(
    query, dep.streamq, dep.stdl, dep.authed, dep.notifier, dep.targetRepository, env.ntfyTopic,
  );

  // start observing
  const observer = new Observer(chzzkChecker);
  observer.observe();
}
