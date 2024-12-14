import {log} from "jslog";
import {Cookie} from "./types.js";

interface ChzzkLiveRequest {
  uid: string
  once: boolean
  cookies?: string
}

export interface Stdl {
  requestChzzkLive(uid: string, once: boolean, cookies: Cookie[] | undefined): Promise<void>
}

export class StdlImpl implements Stdl {

  constructor(private readonly stdlUrl: string) {}

  async requestChzzkLive(
    uid: string,
    once: boolean = true,
    cookies: Cookie[] | undefined = undefined,
  ) {
    let chzzkLive: ChzzkLiveRequest = { uid, once };
    if (cookies) {
      chzzkLive = { ...chzzkLive, cookies: JSON.stringify(cookies) };
    }

    const body = JSON.stringify({ reqType: "chzzk_live", chzzkLive });
    await fetch(this.stdlUrl, {
      method: "POST", headers: { "content-type": "application/json" }, body,
    });
  }
}

export class StdlMock implements Stdl {
  async requestChzzkLive(
    uid: string,
    once: boolean = true,
    cookies: Cookie[] | undefined = undefined,
  ) {
    log.info(`MockStdlClient.request(${uid}, ${once}, ${cookies})`);
  }
}
