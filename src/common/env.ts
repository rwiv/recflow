import {DEFAULT_NTFY_TOPIC} from "./defaults.js";

export interface Env {
  configPath: string;
  streamqUrl: string;
  stdlUrl: string;
  authUrl: string;
  ntfyEndpoint: string | undefined;
  ntfyTopic: string;
  nodeEnv: string;
}

export function readEnv(): Env {
  // CONFIG_PATH
  let configPath = process.env.CONFIG_PATH;
  if (configPath === undefined) {
    throw Error("configPath is undefined");
  }

  // STREAMQ_URL
  let streamqUrl = process.env.STREAMQ_URL;
  if (streamqUrl === undefined) {
    throw Error("streamqUrl is undefined");
  }

  // STDL_URL
  let stdlUrl = process.env.STDL_URL;
  if (stdlUrl === undefined) {
    throw Error("stdlUrl is undefined");
  }

  // AUTH_URL
  let authUrl = process.env.AUTH_URL;
  if (authUrl === undefined) {
    throw Error("authUrl is undefined");
  }

  // NTFY_ENDPOINT
  let ntfyEndpoint = process.env.NTFY_ENDPOINT;
  // NTFY_TOPIC
  let ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;
  // NODE_ENV
  let nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== "prod") {
    nodeEnv = "dev";
  }
  return {
    configPath,
    streamqUrl, stdlUrl, authUrl,
    ntfyEndpoint, ntfyTopic,
    nodeEnv,
  };
}
