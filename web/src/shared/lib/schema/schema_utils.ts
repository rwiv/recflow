import { ZodType, ZodError } from 'zod';

export function parseList<T>(zod: ZodType<T>, list: T[]) {
  return list.map((item) => zod.parse(item));
}

export function zodErrMsg(err: ZodError) {
  if (err.issues.length === 0) {
    return 'Unknown error';
  }
  if (err.issues.length === 1) {
    return err.issues[0].message;
  }
  let msg = '';
  for (const issue of err.issues) {
    msg += `${issue.message}\n`;
  }
  return msg;
}
