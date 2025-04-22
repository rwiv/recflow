import { Inject, Injectable } from '@nestjs/common';
import { ENV } from '../../common/config/config.module.js';
import { Env } from '../../common/config/env.js';
import { Cookie } from './types.js';
import { Authed, cookiesResponse } from './authed.js';
import { HttpRequestError } from '../../utils/errors/errors/HttpRequestError.js';
import { PlatformName } from '../../platform/spec/storage/platform.enum.schema.js';
import { EnumCheckError } from '../../utils/errors/errors/EnumCheckError.js';

@Injectable()
export class AuthedImpl implements Authed {
  private readonly authUrl: string;
  private readonly apiKey: string;

  constructor(@Inject(ENV) private readonly env: Env) {
    this.authUrl = this.env.authed.url;
    this.apiKey = this.env.authed.apiKey;
  }

  async requestCookie(platform: PlatformName): Promise<string> {
    if (platform === 'chzzk') {
      return this.requestChzzkCookieStr();
    } else if (platform === 'soop') {
      return this.requestSoopCookiesStr();
    } else {
      throw new EnumCheckError('Invalid live type');
    }
  }

  async requestChzzkCookieStr(): Promise<string> {
    const res = await fetch(`${this.authUrl}/api/chzzk/cookies/v1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new HttpRequestError('Failed to request chzzk cookies', res.status);
    }
    return cookiesResponse.parse(await res.json()).cookies;
  }

  async requestSoopCookiesStr(): Promise<string> {
    const res = await fetch(`${this.authUrl}/api/soop/cookies/v1`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new HttpRequestError('Failed to request soop cookies', res.status);
    }
    return cookiesResponse.parse(await res.json()).cookies;
  }

  async requestChzzkCookies(): Promise<Cookie[]> {
    const cookieString = await this.requestChzzkCookieStr();
    return cookieString.split(';').map((cookie) => {
      const [name, value] = cookie.trim().split('=');
      return { name, value };
    });
  }

  async requestSoopCookies(): Promise<Cookie[]> {
    const cookieString = await this.requestSoopCookiesStr();
    return cookieString.split(';').map((cookie) => {
      const [name, value] = cookie.trim().split('=');
      return { name, value };
    });
  }
}
