import { contentConstraints } from 'src/core/constants/constraints.constants';
import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';

export class UpdateCommentDto {
  constructor() {}

  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content!: string;
}
