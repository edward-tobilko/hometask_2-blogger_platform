import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException, DomainExceptionCode } from '../domain.exceptions';
import { ErrorResponseBody } from './error-response-body';

// * Ошибки класса DomainException (instanceof DomainException) (https://docs.nestjs.com/exception-filters#exception-filters-1). Nest перехватит только исключения класса DomainException (через instanceof). Всё остальное пойдёт дальше.
@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.code);
    const responseBody = this.buildResponseBody(exception, request.url);

    response.status(status).json(responseBody);
  }

  private mapToHttpStatus(code: DomainExceptionCode): number {
    switch (code) {
      case DomainExceptionCode.BadRequest:
      case DomainExceptionCode.ValidationError:
      case DomainExceptionCode.ConfirmationCodeExpired:
      case DomainExceptionCode.EmailNotConfirmed:
      case DomainExceptionCode.PasswordRecoveryCodeExpired:
        return HttpStatus.BAD_REQUEST;

      case DomainExceptionCode.Forbidden:
        return HttpStatus.FORBIDDEN;

      case DomainExceptionCode.NotFound:
        return HttpStatus.NOT_FOUND;

      case DomainExceptionCode.Unauthorized:
        return HttpStatus.UNAUTHORIZED;

      case DomainExceptionCode.InternalServerError:
        return HttpStatus.INTERNAL_SERVER_ERROR;

      default:
        return HttpStatus.I_AM_A_TEAPOT; // это defensive coding (защитный статус): если появится новый DomainExceptionCode, который не добавили в switch — клиент получит 418 вместо случайного поведения.
    }
  }

  private buildResponseBody(
    exception: DomainException,
    requestUrl: string,
  ): ErrorResponseBody {
    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message: exception.message,
      code: exception.code,
      extensions: exception.extensions,
    };
  }
}

// ? Что происходит при throw new DomainException(...):
// ? - NestJS проверяет: DomainHttpExceptionsFilter — совпадает? Да (@Catch(DomainException)) → обрабатывает.
// ? - AllHttpExceptionsFilter не вызывается вообще.
