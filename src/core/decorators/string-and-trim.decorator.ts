import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';

import { Trim } from './trim.decorator';

export const IsStringWithTrim = (minLength: number, maxLength: number) => {
  return applyDecorators(IsString(), Length(minLength, maxLength), Trim());
};
