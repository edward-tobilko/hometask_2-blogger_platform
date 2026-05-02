import { IsObjectId } from 'src/core/decorators/is-object-id.decorator';

export class PostIdParamDto {
  @IsObjectId()
  postId!: string;
}
