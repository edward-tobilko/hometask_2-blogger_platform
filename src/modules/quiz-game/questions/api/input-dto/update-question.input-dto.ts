import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';

export class UpdateQuestionInputDto {
  @IsStringWithLength(10, 500)
  body!: string;

  @Transform(({ value }): unknown =>
    Array.isArray(value)
      ? value.map((item): unknown =>
          typeof item === 'string' ? item.trim() : item,
        )
      : value,
  ) // тримим каждый элемент; не-строки не трогаем — их отсечёт IsString;
  @IsNotEmpty({ each: true }) // is not empty after the trim;
  @IsString({ each: true }) // each element is a string;
  @ArrayNotEmpty() // at least one correct answer and not empty array;
  @IsArray({ message: 'correctAnswers must be array' }) // check array it is or no;
  correctAnswers!: Array<string>;
}
