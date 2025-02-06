import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpErrorResolver } from '../utils/errors/resolver.http.js';

@Catch(Error)
export class HttpErrorFilter implements ExceptionFilter {
  readonly resolver = new HttpErrorResolver();

  catch(raw: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const err = this.resolver.resolve(raw);

    response.status(err.status).json({
      statusCode: err.status,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
