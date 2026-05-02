import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

// * валидация + трансформация
export const Query = (min: number, max?: number) =>
  applyDecorators(
    IsOptional(),
    IsNumber(),
    Min(min),
    ...(max ? [Max(max)] : []), // защита от DoS (Denial of Service) атак
    Transform(({ value }) => +value),
  );
