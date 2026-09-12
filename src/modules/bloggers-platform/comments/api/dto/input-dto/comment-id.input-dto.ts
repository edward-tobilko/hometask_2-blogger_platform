import { IsUUId } from 'src/core/decorators/is-object-id.decorator';

export class CommentIdParam {
  @IsUUId()
  commentId!: string;
}
