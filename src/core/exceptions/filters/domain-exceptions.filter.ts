import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { DomainException } from '../domain.exception';
import { ErrorResponseBody } from './error-response-body';
import { DomainExceptionCode } from '../domain.exception-codes';

@Catch(DomainException)
export class DomainHttpExceptionsFilter implements ExceptionFilter {
  private mapToHttpStatus(code: DomainExceptionCode): HttpStatus {
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

  catch(exception: DomainException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    const status = this.mapToHttpStatus(exception.code);

    // * По контракту (swagger) мы должны маппить 400-ю ошибку под обьект errorsMessages
    if (status === HttpStatus.BAD_REQUEST) {
      response.status(status).json({
        errorsMessages: exception.extensions.map((e) => ({
          message: e.message,
          field: e.key,
        })),
      });

      return;
    }

    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
      code: exception.code,
      extensions: exception.extensions,
    } as ErrorResponseBody);
  }
}
