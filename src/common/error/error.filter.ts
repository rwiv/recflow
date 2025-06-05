import { ExceptionFilter, Catch, ArgumentsHost, Inject } from '@nestjs/common';
import { Response } from 'express';
import { HttpErrorResolver } from '../../utils/errors/resolver.http.js';
import { log } from 'jslog';
import { stacktrace } from '../../utils/errors/utils.js';
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
    log.error(err.message, { ...err.attr, stack: stacktrace(err) });

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
