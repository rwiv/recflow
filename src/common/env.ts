import {DEFAULT_NTFY_TOPIC} from "./defaults.js";

export interface Env {
  configPath: string;
  stdlUrl: string;
  authUrl: string;
  ntfyEndpoint: string | undefined;
  ntfyTopic: string;
  streamqUrl: string;
  querySize: number;
  nodeEnv: string;
}

export function readEnv(): Env {
  // CONFIG_PATH
  const configPath = process.env.CONFIG_PATH;
  if (configPath === undefined) {
    throw Error("configPath is undefined");
  }

  // STDL_URL
  const stdlUrl = process.env.STDL_URL;
  if (stdlUrl === undefined) {
    throw Error("stdlUrl is undefined");
  }

  // AUTH_URL
  const authUrl = process.env.AUTH_URL;
  if (authUrl === undefined) {
    throw Error("authUrl is undefined");
  }

  // NTFY_ENDPOINT
  const ntfyEndpoint = process.env.NTFY_ENDPOINT;
  // NTFY_TOPIC
  const ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;

  // STREAMQ_URL
  const streamqUrl = process.env.STREAMQ_URL;
  if (streamqUrl === undefined) {
    throw Error("streamqUrl is undefined");
  }
  // QUERY_SIZE
  const querySizeStr = process.env.QUERY_SIZE;
  if (querySizeStr === undefined) {
    throw Error("querySize is undefined");
  }
  const querySize = parseInt(querySizeStr);
  if (isNaN(querySize)) {
    throw Error("querySize is NaN");
  }

  // NODE_ENV
  let nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== "prod") {
    nodeEnv = "dev";
  }

  return {
    configPath,
    stdlUrl, authUrl,
    ntfyEndpoint, ntfyTopic,
    streamqUrl, querySize,
    nodeEnv,
  };
}
