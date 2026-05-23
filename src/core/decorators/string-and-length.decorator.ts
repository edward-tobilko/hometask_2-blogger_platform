import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';

import { Trim } from './trim.decorator';

export const IsStringWithLength = (min: number, max: number) => {
  return applyDecorators(Trim(), IsString(), Length(min, max));
};
