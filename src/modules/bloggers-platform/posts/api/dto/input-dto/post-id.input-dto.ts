import { IsUUId } from 'src/core/decorators/is-object-id.decorator';

export class PostIdParamDto {
  @IsUUId()
  postId!: string;
}
