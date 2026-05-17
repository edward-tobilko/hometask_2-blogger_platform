import { IsStringWithLength } from 'src/core/decorators/string-and-length.decorator';
import { contentForCommentConstraints } from '../../../constraints/posts/posts.constraints';

export class CreateCommentInputDto {
  @IsStringWithLength(
    contentForCommentConstraints.minLength,
    contentForCommentConstraints.maxLength,
  )
  content!: string;
}
