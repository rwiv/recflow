import {Env, readEnv} from "./common/env.js";
import {MockNotifier, Notifier, NtfyNotifier} from "./client/Notifier.js";
import {ChzzkObserver} from "./observer/ChzzkObserver.js";
import {StreamqClient} from "./client/StreamqClient.js";
import {TargetRepositoryMem} from "./repository/TargetRepositoryMem.js";
import {MockStdlClient, StdlClientImpl} from "./client/StdlClient.js";
import {readQueryConfig} from "./common/config.js";
import {log} from "jslog";
import {AuthClientImpl, MockAuthClient} from "./client/AuthClient.js";

export async function run() {
  const env = readEnv();
  const query = await readQueryConfig(env.configPath);
  log.info("Env", env);
  // log.info("Config", query);

  const observer = new ChzzkObserver(
    query,
    new StreamqClient(env.streamqUrl),
    createStdlClient(env),
    createAuthClient(env),
    createNotifier(env),
    createTargetRepository(),
    env.ntfyTopic,
  );
  observer.observe();
}

function createStdlClient(env: Env) {
  if (env.nodeEnv === "prod" && env.stdlUrl !== undefined) {
    return new StdlClientImpl(env.stdlUrl);
  } else {
    return new MockStdlClient();
  }
}

function createAuthClient(env: Env) {
  if (env.nodeEnv === "prod" && env.authUrl !== undefined) {
    return new AuthClientImpl(env.authUrl);
  } else {
    return new MockAuthClient();
  }
}

function createNotifier(env: Env): Notifier {
  if (env.nodeEnv === "prod" && env.ntfyEndpoint !== undefined) {
    return new NtfyNotifier(env.ntfyEndpoint);
  } else {
    return new MockNotifier();
  }
}

function createTargetRepository() {
  return new TargetRepositoryMem();
}
