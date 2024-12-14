import {log} from "jslog";
import {Cookie} from "./types_common.js";

export interface Authed {
  requestChzzkCookies(): Promise<Cookie[] | undefined>;
}

export class AuthedImpl implements Authed {

  constructor(private readonly authUrl: string) {}

  async requestChzzkCookies(): Promise<Cookie[] | undefined> {
    const res = await fetch(`${this.authUrl}/chzzk/cookies/v1`, {
      method: "GET", headers: { "content-type": "application/json" },
    });
    if (!res.ok) {
      log.error("Failed to request chzzk cookies", {status: res.status});
      return undefined;
    }
    const cookies = await res.json() as Cookie[];
    if (cookies.length === 0) {
      log.error("No chzzk cookies");
      return undefined;
    }
    return cookies;
  }
}

export class AuthedMock implements Authed {
  requestChzzkCookies(): Promise<Cookie[] | undefined> {
    log.info("MockAuthClient.requestChzzkCookies");
    return Promise.resolve(undefined);
  }
}
