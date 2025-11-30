import { log } from 'jslog';
import { z } from 'zod';

import { BaseError } from '@/utils/errors/base/BaseError.js';
import { stacktrace } from '@/utils/errors/utils.js';

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

export function printError(err: unknown) {
  if (err instanceof BaseError) {
    log.warn(err.message, { ...err.attr, stack_trace: stacktrace(err) });
  } else if (err instanceof Error) {
    log.warn(err.message, { stack_trace: stacktrace(err) });
  } else {
    log.error('UnknownError', { stack_trace: stacktrace(err) });
  }
}

export function handleSettled<T>(settled: PromiseSettledResult<T>[]) {
  for (const result of settled) {
    if (result.status === 'rejected') {
      printError(result.reason);
    }
  }
}
