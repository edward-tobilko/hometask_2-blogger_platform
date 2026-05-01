import { applyDecorators } from '@nestjs/common';
import { IsMongoId, IsString } from 'class-validator';

export const IdValidation = () => {
  return applyDecorators(IsString(), IsMongoId());
};
