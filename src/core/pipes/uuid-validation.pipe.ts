import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { DomainException, Extension } from '../exceptions/domain.exception';
import { DomainExceptionCode } from '../exceptions/domain.exception-codes';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class UuidValidationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.metatype !== String) return value;

    if (!UUID_REGEX.test(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid UUID: ${value}`,
        extensions: [
          new Extension(`Invalid UUID: ${value}`, metadata.data ?? 'id'),
        ], // response for client
      });
    }

    return value;
  }
}
