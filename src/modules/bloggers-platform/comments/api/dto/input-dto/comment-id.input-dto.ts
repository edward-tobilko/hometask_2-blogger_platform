import { IsObjectId } from 'src/core/decorators/is-object-id.decorator';

export class CommentIdParam {
  @IsObjectId()
  commentId!: string;
}
