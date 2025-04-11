import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { Response } from 'express';
import { HttpErrorResolver } from '../../utils/errors/resolver.http.js';
import { log } from 'jslog';
import { stackTrace } from '../../utils/errors/utils.js';
import { ErrorResponse } from '../data/common.schema.js';
import { ENV } from '../config/config.module.js';
import { Env } from '../config/env.js';

@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {
  readonly resolver = new HttpErrorResolver();

  constructor(@Inject(ENV) private readonly env: Env) {}

  catch(raw: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = this.resolver.resolve(raw);
    if (this.env.nodeEnv !== 'prod') {
      log.error('NODE_ENV is not prod', { stack: stackTrace(err) });
    }
    const { message, status, code } = err;
    log.error(err.name, { message, status, code, stack: stackTrace(err) });

    let body: ErrorResponse = {
      statusCode: err.status,
      message: err.message,
      timestamp: new Date().toISOString(),
    };
    if (err.code) {
      body = { ...body, code: err.code };
    }
    response.status(err.status).json(body);
  }
}
