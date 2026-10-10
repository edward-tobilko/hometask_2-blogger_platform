import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: Extension[],
): Extension[] => {
  const errorsForResponse = errorMessage || [];

  // * Перебираем поля DTO (login, email, isConfirmed...)
  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      // * Перебираем нарушения одного вложеного поля (name). Одно поле может нарушать несколько правил одновременно (но у нас stopAtFirstError: true, поэтому будет максимум одно).
      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}` // -> blogId must be a UUID id; Received value: 1;
            : '',
          key: error.property, // -> blogId;
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,

      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        return new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors, // массив { message: string, key: string }[], который по сигнатуре совпадает с Extension[];
        });
      },
    }),
  );
}
