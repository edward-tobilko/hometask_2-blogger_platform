import { IsStringWithTrim } from 'src/core/decorators/string-and-trim.decorator';
import { commentsContentConstraints } from '../../../constraints/comments.constraints';

export class UpdateCommentDto {
  constructor() {}

  @IsStringWithTrim(
    commentsContentConstraints.minLength,
    commentsContentConstraints.maxLength,
  )
  content!: string;
}
