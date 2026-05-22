import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';
import { contentConstraints } from '../../../constraints/comments.constraints';

export class UpdateCommentDto {
  constructor() {}

  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content!: string;
}
