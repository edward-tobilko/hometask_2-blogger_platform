import { applyDecorators } from '@nestjs/common';
import { IsMongoId, IsString } from 'class-validator';

// * валидация
export const IsObjectId = () => {
  return applyDecorators(IsString(), IsMongoId());
};
