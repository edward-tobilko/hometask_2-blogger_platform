import { applyDecorators } from '@nestjs/common';
import { IsString, IsUUID } from 'class-validator';

// * Validation
export const IsUUId = () => {
  return applyDecorators(IsString(), IsUUID());
};
