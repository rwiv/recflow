import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { log } from 'jslog';

import { HttpErrorResolver } from '@/utils/errors/resolver.http.js';
import { stacktrace } from '@/utils/errors/utils.js';

import { ErrorResponse } from '@/common/data/common.schema.js';

@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {
  readonly resolver = new HttpErrorResolver();

  catch(raw: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = this.resolver.resolve(raw);
    log.error(err.message, { ...err.attr, stack_trace: stacktrace(err) });

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
