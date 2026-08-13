import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

import { DomainException } from '../exceptions/domain.exception';
import { DomainExceptionCode } from '../exceptions/domain.exception-codes';

// * Custom pipe example (https://docs.nestjs.com/pipes#custom-pipes)
@Injectable()
// * presentation layer - избавляет от new Types.ObjectId(id) внутри сервиса или репозитория
export class ObjectIdValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    // * Проверяем, что тип данных в декораторе — ObjectId.
    if (metadata.metatype !== Types.ObjectId) {
      return value; // Если тип не ObjectId, возвращаем значение без изменений
    }

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    return new Types.ObjectId(value); // Преобразуем строку в ObjectId
  }
}
