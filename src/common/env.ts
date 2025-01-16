import {DEFAULT_NTFY_TOPIC} from "./defaults.js";

export interface Env {
  configPath: string;
  streamqUrl: string;
  streamqQsize: number;
  stdlUrl: string;
  authedUrl: string;
  authedEncKey: string;
  ntfyEndpoint: string | undefined;
  ntfyTopic: string;
  nodeEnv: string;
}

export function readEnv(): Env {
  // CONFIG_PATH
  const configPath = process.env.CONFIG_PATH;
  if (configPath === undefined) {
    throw Error("configPath is undefined");
  }

  // STREAMQ_URL
  const streamqUrl = process.env.STREAMQ_URL;
  if (streamqUrl === undefined) {
    throw Error("streamqUrl is undefined");
  }
  // STREAMQ_QSIZE
  const qsizeStr = process.env.STREAMQ_QSIZE;
  if (qsizeStr === undefined) {
    throw Error("streamqQsize is undefined");
  }
  const streamqQsize = parseInt(qsizeStr);
  if (isNaN(streamqQsize)) {
    throw Error("streamqQsize is NaN");
  }

  // STDL_URL
  const stdlUrl = process.env.STDL_URL;
  if (stdlUrl === undefined) {
    throw Error("stdlUrl is undefined");
  }

  // AUTHED_URL
  const authedUrl = process.env.AUTHED_URL;
  if (authedUrl === undefined) {
    throw Error("authUrl is undefined");
  }
  // AUTHED_ENCKEY
  const authedEncKey = process.env.AUTHED_ENCKEY;
  if (authedEncKey === undefined) {
    throw Error("authedEncKey is undefined");
  }
  if (authedEncKey.length !== 32) {
    throw new Error("Key must be 32 bytes");
  }

  // NTFY_ENDPOINT
  const ntfyEndpoint = process.env.NTFY_ENDPOINT;
  // NTFY_TOPIC
  const ntfyTopic = process.env.NTFY_TOPIC ?? DEFAULT_NTFY_TOPIC;

  // NODE_ENV
  let nodeEnv = process.env.NODE_ENV;
  if (nodeEnv !== "prod") {
    nodeEnv = "dev";
  }

  return {
    configPath,
    streamqUrl, streamqQsize,
    stdlUrl,
    authedUrl, authedEncKey,
    ntfyEndpoint, ntfyTopic,
    nodeEnv,
  };
}
