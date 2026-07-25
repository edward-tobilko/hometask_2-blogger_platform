import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ErrorResponseBody } from './error-response-body';
import { DomainExceptionCode } from '../domain.exception-codes';

@Catch(HttpException)
export class AllHttpExceptionsFilter implements ExceptionFilter {
  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ErrorResponseBody {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        message: '',
        extensions: [],
        code: DomainExceptionCode.InternalServerError,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      extensions: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }

  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp(); // нужен, чтобы получить request и response (express)
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const message = exception.message || 'Unknown exception occurred.';
    const status = exception.getStatus(); // берёт статус из самого объекта исключения. Если NestJS кинул 404 — вернётся 404
    const responseBody = this.buildResponseBody(request.url, message);

    response.status(status).json(responseBody);
  }
}
