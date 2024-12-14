import {log} from "jslog";
import {Cookie} from "./types_common.js";

interface ChzzkLiveRequest {
  uid: string
  once: boolean
  cookies?: string
}

// TODO: Rename to SoopLiveRequest
interface AfreecaLiveRequest {
  userId: string;
  once: boolean;
  cred?: SoopCred;
}

export interface SoopCred {
  username: string;
  password: string;
}

export interface Stdl {
  requestChzzkLive(uid: string, once: boolean, cookies: Cookie[] | undefined): Promise<void>
  requestSoopLive(userId: string, once: boolean, cred: SoopCred | undefined): Promise<void>
}

export class StdlImpl implements Stdl {

  constructor(private readonly stdlUrl: string) {}

  async requestChzzkLive(
    uid: string, once: boolean = true, cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    let chzzkLive: ChzzkLiveRequest = { uid, once };
    if (cookies) {
      chzzkLive = { ...chzzkLive, cookies: JSON.stringify(cookies) };
    }

    const body = JSON.stringify({ reqType: "chzzk_live", chzzkLive });
    await fetch(this.stdlUrl, {
      method: "POST", headers: { "content-type": "application/json" }, body,
    });
  }

  async requestSoopLive(
    userId: string, once: boolean = true, cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    // TODO: Rename to soopLive, SoopLiveRequest
    let afreecaLive: AfreecaLiveRequest = { userId, once };
    if (cred) {
      afreecaLive = { ...afreecaLive, cred };
    }

    // TODO: Rename to soop_live
    const body = JSON.stringify({ reqType: "afreeca_live", afreecaLive });
    await fetch(this.stdlUrl, {
      method: "POST", headers: { "content-type": "application/json" }, body,
    });
  }
}

export class StdlMock implements Stdl {
  async requestChzzkLive(
    uid: string, once: boolean = true, cookies: Cookie[] | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestChzzkLive(${uid}, ${once}, ${cookies})`);
  }

  async requestSoopLive(
    uid: string, once: boolean = true, cred: SoopCred | undefined = undefined,
  ): Promise<void> {
    log.info(`MockStdlClient.requestSoopLive(${uid}, ${once}, ${cred})`);
  }
}
