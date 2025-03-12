import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { HttpErrorResolver } from '../../utils/errors/resolver.http.js';
import { log } from 'jslog';
import { stackTrace } from '../../utils/errors/utils.js';
import { ErrorResponse } from '../data/common.schema.js';

@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {
  readonly resolver = new HttpErrorResolver();

  catch(raw: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const err = this.resolver.resolve(raw);
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
