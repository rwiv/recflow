export interface Cookie {
  domain: string;
  expirationDate: number;
  httpOnly: boolean;
  name: string;
  path: string;
  sameSite: string;
  secure: boolean;
  value: string;
}
