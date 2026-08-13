import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

import { DomainException } from '../exceptions/domain.exception';
import { DomainExceptionCode } from '../exceptions/domain.exception-codes';

@Injectable()
export class IdValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    // * Проверяем, что тип данных в декораторе — string.
    if (metadata.metatype !== String) {
      return value; // Если тип не string, возвращаем значение без изменений
    }

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ID: ${value}`,
      });
    }

    return value;
  }
}
