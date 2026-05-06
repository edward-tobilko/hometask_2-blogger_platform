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
import { ObjectIdValidationTransformationPipe } from 'src/core/pipes/object-id-validation-transformation.pipe';

// * функция использует рекурсию для обхода объекта children при вложенных полях при валидации (корректно обрабатывает вложенные объекты в обьекте).
export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: Extension[],
): Extension[] => {
  const errorsForResponse = errorMessage || []; // errorsForResponse - передаётся по ссылке в рекурсию. Поэтому вложенные ошибки попадают в тот же массив, а не создают новый. Именно для этого нужен параметр errorMessage.

  // * перебираем поля DTO (login, email, isConfirmed...)
  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      // * перебираем нарушения одного вложеного поля (name). Одно поле может нарушать несколько правил одновременно (но у нас stopAtFirstError: true, поэтому будет максимум одно).
      for (const key of constrainKeys) {

        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}` // -> blogId must be a mongodb id; Received value: 1
            : '',
          key: error.property, // -> blogId
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  // * Глобальный пайп для валидации и трансформации входящих данных
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),

    new ValidationPipe({
      transform: true, // входные данные автоматически преобразуются в экземпляр DTO-класса, разрешает @Transform декораторы работать (без этого, например, строки не превратятся в числа).
      whitelist: true, // убирает из DTO поля, которых нет в классе (защита от лишних данных в запросе)
      stopAtFirstError: true, // выдает первую ошибку для каждого поля
      forbidNonWhitelisted: true, // работает в паре с whitelist — отвергает запрос с ошибкой 400, если есть лишние поля. Без этого whitelist просто проигнорит лишнее поле.

      // * Для преобразования ошибок класс валидатора в необходимый вид (превращает ошибки валидации в DomainException → они попадут в DomainHttpExceptionsFilter → ответ будет в едином формате для всего API).
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        return new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors, // массив { message: string, key: string }[], который по сигнатуре совпадает с Extension[].
        });
      },
    }),
  );
}
