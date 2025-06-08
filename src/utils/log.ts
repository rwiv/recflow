import { z } from 'zod';
import { log } from 'jslog';

export const logLevel = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);
export type LogLevel = z.infer<typeof logLevel>;

export function logging(msg: string, attr: object, level: LogLevel) {
  switch (level) {
    case 'fatal':
      log.fatal(msg, attr);
      break;
    case 'error':
      log.error(msg, attr);
      break;
    case 'warn':
      log.warn(msg, attr);
      break;
    case 'info':
      log.info(msg, attr);
      break;
    case 'debug':
      log.debug(msg, attr);
      break;
    case 'trace':
      log.trace(msg, attr);
      break;
    default:
      throw new Error(`Unknown log level: ${level}`);
  }
}
