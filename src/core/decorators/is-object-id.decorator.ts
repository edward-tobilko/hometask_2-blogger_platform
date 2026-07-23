import { applyDecorators } from '@nestjs/common';
import { IsMongoId, IsString } from 'class-validator';

// * Validation
export const IsObjectId = () => {
  return applyDecorators(IsString(), IsMongoId());
};
