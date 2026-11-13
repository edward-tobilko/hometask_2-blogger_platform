import { IsArray } from 'class-validator';

import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';

export class CreateQuestionInputDto {
  constructor() {}

  @IsStringWithLength(10, 500)
  body!: string;

  @IsArray()
  correctAnswers!: Array<string>;
}
